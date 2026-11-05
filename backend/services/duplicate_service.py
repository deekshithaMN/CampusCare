import logging

logger = logging.getLogger(__name__)

try:
    from rapidfuzz import fuzz
except ImportError:
    fuzz = None

try:
    from sklearn.feature_extraction.text import TfidfVectorizer
    from sklearn.metrics.pairwise import cosine_similarity
except ImportError:
    TfidfVectorizer = None
    cosine_similarity = None

def find_candidate_duplicates(new_title: str, new_description: str, new_location: str, existing_complaints: list) -> list:
    """
    Evaluates candidate duplicates using RapidFuzz and scikit-learn TF-IDF Cosine Similarity.
    
    Args:
        new_title: Title of draft complaint
        new_description: Description of draft complaint
        new_location: Location of draft complaint
        existing_complaints: list of dicts with keys:
            ['id', 'title', 'description', 'location', 'category']
            
    Returns:
        List of candidate duplicate dicts sorted by similarity descending.
    """
    if not existing_complaints:
        return []

    new_full_text = f"{new_title} {new_description}".strip().lower()
    if not new_full_text:
        return []

    corpus = [f"{c['title']} {c['description']}".strip().lower() for c in existing_complaints]

    # Calculate TF-IDF cosine similarities
    cosine_sims = [0.0] * len(existing_complaints)
    if TfidfVectorizer and cosine_similarity and len(corpus) > 0:
        try:
            vectorizer = TfidfVectorizer(stop_words='english', min_df=1)
            tfidf_matrix = vectorizer.fit_transform([new_full_text] + corpus)
            sim_matrix = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:])
            cosine_sims = sim_matrix.flatten().tolist()
        except Exception as e:
            logger.warning(f"TF-IDF vectorizer fallback triggered: {e}")
            cosine_sims = [0.0] * len(existing_complaints)

    results = []
    for idx, complaint in enumerate(existing_complaints):
        existing_text = corpus[idx]
        
        # 1. RapidFuzz token sort ratio (0.0 to 1.0)
        if fuzz:
            fuzz_score = fuzz.token_sort_ratio(new_full_text, existing_text) / 100.0
            # Also calculate location fuzzy match
            loc_fuzz = fuzz.partial_ratio(new_location.lower(), complaint.get('location', '').lower()) / 100.0
        else:
            # Simple fallback token overlap
            words1 = set(new_full_text.split())
            words2 = set(existing_text.split())
            intersection = words1.intersection(words2)
            fuzz_score = len(intersection) / max(len(words1.union(words2)), 1)
            loc_fuzz = 1.0 if new_location.lower() in complaint.get('location', '').lower() else 0.5

        tfidf_score = float(cosine_sims[idx])

        # Hybrid similarity score
        # 40% lexical (RapidFuzz) + 40% semantic (TF-IDF) + 20% location proximity bonus
        text_hybrid = (0.5 * fuzz_score) + (0.5 * tfidf_score)
        total_similarity = round((0.8 * text_hybrid) + (0.2 * loc_fuzz), 3)

        # Flag if total similarity meets or exceeds 0.55 threshold
        if total_similarity >= 0.50:
            results.append({
                "complaint_id": str(complaint['id']),
                "title": complaint['title'],
                "location": complaint['location'],
                "category": complaint.get('category', ''),
                "similarity_score": round(total_similarity, 2),
                "similarity_percentage": int(total_similarity * 100),
                "metrics": {
                    "lexical_score": round(fuzz_score, 2),
                    "semantic_score": round(tfidf_score, 2),
                    "location_score": round(loc_fuzz, 2)
                }
            })

    return sorted(results, key=lambda x: x['similarity_score'], reverse=True)

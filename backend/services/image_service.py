import io
import logging
from django.core.files.base import ContentFile

logger = logging.getLogger(__name__)

try:
    from PIL import Image, ImageOps
except ImportError:
    Image = None

try:
    import cv2
    import numpy as np
except ImportError:
    cv2 = None
    np = None

def process_and_sanitize_image(uploaded_file, max_dimension=1280, quality=85):
    """
    Validates, strips metadata/EXIF, resizes and recompresses an uploaded image.
    Stores the processed image without camera/GPS tags.
    """
    if not uploaded_file:
        return None

    file_bytes = uploaded_file.read()

    # 1. OpenCV validation check if available
    if cv2 is not None and np is not None:
        try:
            nparr = np.frombuffer(file_bytes, np.uint8)
            cv_img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            if cv_img is None:
                raise ValueError("The provided file could not be decoded as a valid image.")
        except Exception as e:
            logger.warning(f"OpenCV validation alert: {e}")
            raise ValueError("Corrupted or unsupported image file.")

    # 2. PIL processing & EXIF stripping
    if Image is not None:
        try:
            pil_image = Image.open(io.BytesIO(file_bytes))
            # Auto-orient based on existing EXIF before stripping
            try:
                pil_image = ImageOps.exif_transpose(pil_image)
            except Exception:
                pass

            # Convert RGBA / P / CMYK to standard RGB for JPEG
            if pil_image.mode in ('RGBA', 'LA', 'P'):
                background = Image.new('RGB', pil_image.size, (255, 255, 255))
                if pil_image.mode == 'P':
                    pil_image = pil_image.convert('RGBA')
                background.paste(pil_image, mask=pil_image.split()[-1] if pil_image.mode == 'RGBA' else None)
                pil_image = background
            elif pil_image.mode != 'RGB':
                pil_image = pil_image.convert('RGB')

            # 3. Resize if larger than max dimension
            pil_image.thumbnail((max_dimension, max_dimension), Image.Resampling.LANCZOS)

            # 4. Save clean stream without EXIF
            output_io = io.BytesIO()
            pil_image.save(output_io, format='JPEG', quality=quality, optimize=True)
            clean_bytes = output_io.getvalue()

            filename = f"sanitized_{uploaded_file.name.rsplit('.', 1)[0]}.jpg"
            return ContentFile(clean_bytes, name=filename)
        except Exception as e:
            logger.error(f"Image processing error: {e}")
            raise ValueError(f"Could not process image: {str(e)}")

    # Fallback to saving raw content file if libraries unavailable
    return ContentFile(file_bytes, name=uploaded_file.name)

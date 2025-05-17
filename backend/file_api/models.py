import os
import uuid
from django.db import models
from django.conf import settings
from django.core.validators import FileExtensionValidator, MinValueValidator, MaxValueValidator
from django.core.exceptions import ValidationError

def user_directory_path(instance, filename):
    """
    Generate the file path for uploaded files.
    
    Args:
        instance: The UserFile instance
        filename: The original filename
        
    Returns:
        str: The path where the file will be stored
    """
    # Sanitize filename to prevent path traversal
    safe_filename = os.path.basename(filename)
    return os.path.join('user_files', safe_filename)

class UserFile(models.Model):
    """
    Model representing a user-uploaded file.
    
    Attributes:
        id (UUID): Unique identifier for the file
        title (str): User-friendly name for the file
        file (FileField): The actual file
        file_type (str): File extension/type
        file_size (int): Size of file in bytes
        uploaded_at (datetime): Timestamp of upload
    """
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(
        max_length=255,
        help_text="User-friendly name for the file"
    )
    file = models.FileField(
        upload_to=user_directory_path,
        validators=[
            FileExtensionValidator(allowed_extensions=settings.ALLOWED_FILE_EXTENSIONS)
        ],
        help_text="The actual file to be stored"
    )
    file_type = models.CharField(
        max_length=10,
        help_text="File extension/type"
    )
    file_size = models.IntegerField(
        validators=[
            MinValueValidator(0),
            MaxValueValidator(settings.MAX_UPLOAD_SIZE)
        ],
        help_text="Size of file in bytes"
    )
    uploaded_at = models.DateTimeField(
        auto_now_add=True,
        help_text="Timestamp when the file was uploaded"
    )
    
    class Meta:
        ordering = ['-uploaded_at']
        verbose_name = "User File"
        verbose_name_plural = "User Files"
    
    def __str__(self):
        return f"{self.title} ({self.file_type})"
    
    def clean(self):
        """
        Validate the model instance.
        
        Raises:
            ValidationError: If the file size exceeds the maximum allowed size
        """
        if self.file and self.file.size > settings.MAX_UPLOAD_SIZE:
            raise ValidationError({
                'file': f'File size must be no more than {settings.MAX_UPLOAD_SIZE} bytes'
            })
    
    def save(self, *args, **kwargs):
        """
        Save the model instance, setting file type and size.
        
        Args:
            *args: Variable length argument list
            **kwargs: Arbitrary keyword arguments
        """
        if self.file:
            # Set file type and size before saving
            file_extension = os.path.splitext(self.file.name)[1][1:].lower()
            self.file_type = file_extension
            self.file_size = self.file.size
            
            # Validate file type
            if file_extension not in settings.ALLOWED_FILE_EXTENSIONS:
                raise ValidationError({
                    'file': f'File type {file_extension} is not allowed'
                })
        
        self.full_clean()  # Run all validators
        super().save(*args, **kwargs)

from django.apps import AppConfig

class FileApiConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'file_api'
    
    def ready(self):
        # Create the file storage directory if it doesn't exist
        import os
        from django.conf import settings
        os.makedirs(settings.FILE_STORAGE_PATH, exist_ok=True)
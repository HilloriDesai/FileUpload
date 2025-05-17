import os
import logging
from typing import Any, Dict
from django.conf import settings
from django.http import FileResponse, HttpRequest
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.request import Request
from rest_framework.exceptions import ValidationError, NotFound
from .models import UserFile
from .serializers import UserFileSerializer

# Configure logging
logger = logging.getLogger(__name__)

class UserFileViewSet(viewsets.ModelViewSet):
    """
    ViewSet for handling file operations including upload, download, and listing.
    
    This ViewSet provides endpoints for:
    - Listing all files
    - Uploading new files
    - Downloading existing files
    - Viewing file details
    
    Attributes:
        queryset: Base queryset for file operations
        serializer_class: Serializer for file data
        parser_classes: Supported request parsers
    """
    queryset = UserFile.objects.all().order_by('-uploaded_at')
    serializer_class = UserFileSerializer
    parser_classes = (MultiPartParser, FormParser)
    
    def _handle_exception(self, exc: Exception, context: Dict[str, Any]) -> Response:
        """
        Custom exception handler for the ViewSet.
        
        Args:
            exc: The exception that was raised
            context: Additional context about the request
            
        Returns:
            Response: Appropriate error response
        """
        logger.error(f"Error in {context['view'].__class__.__name__}: {str(exc)}")
        
        if isinstance(exc, ValidationError):
            return Response(
                {'error': str(exc)},
                status=status.HTTP_400_BAD_REQUEST
            )
        elif isinstance(exc, NotFound):
            return Response(
                {'error': 'Resource not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        return Response(
            {'error': 'An unexpected error occurred'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
    
    def create(self, request: Request, *args: Any, **kwargs: Any) -> Response:
        """
        Handle file upload.
        
        Args:
            request: The HTTP request containing the file data
            
        Returns:
            Response: HTTP 201 Created with file details on success
            
        Raises:
            ValidationError: If file validation fails
        """
        try:
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            self.perform_create(serializer)
            headers = self.get_success_headers(serializer.data)
            
            logger.info(f"File uploaded successfully: {serializer.data['title']}")
            return Response(
                serializer.data,
                status=status.HTTP_201_CREATED,
                headers=headers
            )
        except Exception as e:
            logger.error(f"File upload failed: {str(e)}")
            return self._handle_exception(e, {'view': self})
    
    def list(self, request: Request, *args: Any, **kwargs: Any) -> Response:
        """
        List all files.
        
        Args:
            request: The HTTP request
            
        Returns:
            Response: HTTP 200 OK with list of files
        """
        try:
            queryset = self.filter_queryset(self.get_queryset())
            serializer = self.get_serializer(queryset, many=True)
            return Response(serializer.data)
        except Exception as e:
            logger.error(f"Failed to list files: {str(e)}")
            return self._handle_exception(e, {'view': self})
    
    @action(detail=True, methods=['get'])
    def download(self, request: Request, pk: str = None) -> Response:
        """
        Download a specific file.
        
        Args:
            request: The HTTP request
            pk: The primary key of the file to download
            
        Returns:
            Response: FileResponse for successful download or error message
            
        Raises:
            NotFound: If file is not found
        """
        try:
            file_obj = self.get_object()
            file_path = file_obj.file.path
            
            if not os.path.exists(file_path):
                logger.error(f"File not found on server: {file_path}")
                raise NotFound("File not found on server")
            
            logger.info(f"File download started: {file_obj.title}")
            response = FileResponse(open(file_path, 'rb'))
            response['Content-Disposition'] = f'attachment; filename="{os.path.basename(file_path)}"'
            return response
            
        except Exception as e:
            logger.error(f"File download failed: {str(e)}")
            return self._handle_exception(e, {'view': self})

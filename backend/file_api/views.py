import os
import logging
from typing import Any, Dict
from django.conf import settings
from django.http import FileResponse, HttpRequest
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
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
    - Moving files to bin
    - Restoring files from bin
    - Permanently deleting files
    
    Attributes:
        queryset: Base queryset for file operations
        serializer_class: Serializer for file data
        parser_classes: Supported request parsers
    """
    queryset = UserFile.objects.all().order_by('-uploaded_at')
    serializer_class = UserFileSerializer
    parser_classes = (MultiPartParser, FormParser, JSONParser)
    
    def get_queryset(self):
        """
        Get the appropriate queryset based on the action.
        For list action, only show restored files.
        For bin action, only show deleted files.
        """
        if self.action == 'bin':
            return UserFile.objects.filter(state=UserFile.FileState.DELETED).order_by('-uploaded_at')
        elif self.action == 'list_users':
            ownerIds = UserFile.objects.values('ownerId').distinct()
            return ownerIds
        elif self.action == 'list_restored':
            # Filter files by ownerId
            ownerId = self.request.query_params.get('ownerId')
            return UserFile.objects.filter(state=UserFile.FileState.RESTORED, ownerId=ownerId).order_by('-uploaded_at')
        elif self.action == 'list_shared':
            # Filter files by userIds
            userId = self.request.query_params.get('userId')
            return UserFile.objects.filter(state=UserFile.FileState.RESTORED, userIds__contains=userId).order_by('-uploaded_at')
        return UserFile.objects.all().order_by('-uploaded_at')
    
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
    
    @action(detail=False, methods=['get'])
    def list_restored(self, request: Request, *args: Any, **kwargs: Any) -> Response:
        """
        List all restored files.
        
        Args:
            request: The HTTP request
            Header: ownerId
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
    
    @action(detail=False, methods=['get'])
    def list_shared(self, request: Request, *args: Any, **kwargs: Any) -> Response:
        """
        List all shared files.
        
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
    @action(detail=True, methods=['post'])
    def move_to_bin(self, request: Request, pk: str = None) -> Response:
        """
        Move a file to the bin by marking it as deleted.
        
        Args:
            request: The HTTP request
            pk: The primary key of the file
            
        Returns:
            Response: Success or error message
        """
        try:
            file_obj = self.get_object()
            file_obj.state = UserFile.FileState.DELETED
            file_obj.save()
            
            logger.info(f"File moved to bin: {file_obj.title}")
            return Response(
                {'message': 'File moved to bin successfully'},
                status=status.HTTP_200_OK
            )
        except Exception as e:
            logger.error(f"Failed to move file to bin: {str(e)}")
            return self._handle_exception(e, {'view': self})
    
    @action(detail=True, methods=['post'])
    def restore(self, request: Request, pk: str = None) -> Response:
        """
        Restore a file from the bin.
        
        Args:
            request: The HTTP request
            pk: The primary key of the file
            
        Returns:
            Response: Success or error message
        """
        try:
            file_obj = self.get_object()
            file_obj.state = UserFile.FileState.RESTORED
            file_obj.save()
            
            logger.info(f"File restored: {file_obj.title}")
            return Response(
                {'message': 'File restored successfully'},
                status=status.HTTP_200_OK
            )
        except Exception as e:
            logger.error(f"Failed to restore file: {str(e)}")
            return self._handle_exception(e, {'view': self})
    
    @action(detail=True, methods=['delete'])
    def permanent_delete(self, request: Request, pk: str = None) -> Response:
        """
        Permanently delete a file from the system.
        
        Args:
            request: The HTTP request
            pk: The primary key of the file
            
        Returns:
            Response: Success or error message
        """
        try:
            file_obj = self.get_object()
            file_path = file_obj.file.path
            
            # Delete the actual file from storage
            if os.path.exists(file_path):
                os.remove(file_path)
            
            # Delete the database record
            file_obj.delete()
            
            logger.info(f"File permanently deleted: {file_obj.title}")
            return Response(
                {'message': 'File permanently deleted'},
                status=status.HTTP_204_NO_CONTENT
            )
        except Exception as e:
            logger.error(f"Failed to permanently delete file: {str(e)}")
            return self._handle_exception(e, {'view': self})
    
    @action(detail=False, methods=['get'])
    def bin(self, request: Request) -> Response:
        """
        List all files in the bin (deleted state).
        
        Args:
            request: The HTTP request
            
        Returns:
            Response: HTTP 200 OK with list of deleted files
        """
        try:
            queryset = self.filter_queryset(self.get_queryset())
            serializer = self.get_serializer(queryset, many=True)
            return Response(serializer.data)
        except Exception as e:
            logger.error(f"Failed to list bin files: {str(e)}")
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
    
    @action(detail=True, methods=['post'])
    def share_file(self, request: Request, pk: str = None) -> Response:
        """
        Share a file with users (userIds in the request body in application/json format)
        
        Args:
            request: The HTTP request
            pk: The primary key of the file
            
        Returns:
            Response: Success or error message
        """
        try: 
            file_obj = self.get_object()
            userIds = request.data.get('userIds', [])
            
            # Initialize userIds if it's None
            if file_obj.userIds is None:
                file_obj.userIds = []
            
            # Add new userIds if they don't already exist
            for userId in userIds:
                if userId not in file_obj.userIds:
                    file_obj.userIds.append(userId)
            
            file_obj.save()
            return Response({'message': 'File shared successfully'}, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Failed to share file: {str(e)}")
            return self._handle_exception(e, {'view': self})
      
    @action(detail=False, methods=['get'])
    def list_users(self, request: Request, *args: Any, **kwargs: Any) -> Response:
        """
        List all users.
        
        Args:
            request: The HTTP request
            
        Returns:
            Response: HTTP 200 OK with list of users
        """
        try:
            ownerIds = UserFile.objects.values('ownerId').distinct()
            ownerIds = list(set([ownerId['ownerId'] for ownerId in ownerIds]))
            return Response(ownerIds)
        except Exception as e:
            logger.error(f"Failed to list files: {str(e)}")
            return self._handle_exception(e, {'view': self})
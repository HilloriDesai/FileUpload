import os
from rest_framework import serializers
from .models import UserFile
from django.conf import settings

class UserFileSerializer(serializers.ModelSerializer):
    file_url = serializers.SerializerMethodField()
    
    class Meta:
        model = UserFile
        fields = ['id', 'title', 'file', 'file_type', 'file_size', 'uploaded_at', 'file_url']
        read_only_fields = ['id', 'file_type', 'file_size', 'uploaded_at', 'file_url']
    
    def get_file_url(self, obj):
        request = self.context.get('request')
        file_url = obj.file.url
        return request.build_absolute_uri(file_url) if request else file_url
    
    def validate_file(self, value):
        # Check file size
        if value.size > settings.MAX_UPLOAD_SIZE:
            max_size_mb = settings.MAX_UPLOAD_SIZE / (1024 * 1024)
            raise serializers.ValidationError(f'File size cannot exceed {max_size_mb} MB.')
        
        # Check file extension
        file_extension = os.path.splitext(value.name)[1][1:].lower()
        if file_extension not in settings.ALLOWED_FILE_EXTENSIONS:
            allowed_extensions = ', '.join(settings.ALLOWED_FILE_EXTENSIONS)
            raise serializers.ValidationError(f'File type not supported. Allowed types: {allowed_extensions}')
        
        return value
    
    def create(self, validated_data):
        # Set the title to the filename if not provided
        if 'title' not in validated_data:
            validated_data['title'] = os.path.splitext(validated_data['file'].name)[0]
        return super().create(validated_data)

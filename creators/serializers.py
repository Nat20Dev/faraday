from rest_framework import serializers
from .models import Creator, SocialLink, Tag, Note


class SocialLinkSerializer(serializers.ModelSerializer):
    class Meta:
        model = SocialLink
        fields = ['id', 'platform', 'url', 'handle', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ['id', 'key', 'value', 'created_at']
        read_only_fields = ['id', 'created_at']


class NoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Note
        fields = ['id', 'content', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class CreatorListSerializer(serializers.ModelSerializer):
    social_links = SocialLinkSerializer(many=True, read_only=True)

    class Meta:
        model = Creator
        fields = ['id', 'name', 'username', 'email', 'source', 'created_at', 'updated_at', 'social_links']


class CreatorDetailSerializer(serializers.ModelSerializer):
    social_links = SocialLinkSerializer(many=True, read_only=True)
    tags = TagSerializer(many=True, read_only=True)
    notes = NoteSerializer(many=True, read_only=True)

    class Meta:
        model = Creator
        fields = ['id', 'name', 'username', 'email', 'address', 'source', 'created_at', 'updated_at', 'social_links', 'tags', 'notes']


class CreatorWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Creator
        fields = ['id', 'name', 'username', 'email', 'address', 'source']

    def validate_source(self, value):
        if value not in dict(Creator.Source.choices):
            raise serializers.ValidationError(f'Invalid source. Must be one of: {", ".join(dict(Creator.Source.choices).keys())}')
        return value

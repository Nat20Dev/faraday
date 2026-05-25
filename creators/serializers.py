from rest_framework import serializers
from .models import Creator, SocialLink, Tag, Note, Team, TeamSocialLink, TeamTag, TeamNote


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


class TeamSocialLinkSerializer(serializers.ModelSerializer):
    class Meta:
        model = TeamSocialLink
        fields = ['id', 'platform', 'url', 'handle', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class TeamTagSerializer(serializers.ModelSerializer):
    class Meta:
        model = TeamTag
        fields = ['id', 'key', 'value', 'created_at']
        read_only_fields = ['id', 'created_at']


class TeamNoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = TeamNote
        fields = ['id', 'content', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class TeamListSerializer(serializers.ModelSerializer):
    social_links = TeamSocialLinkSerializer(many=True, read_only=True, source='team_social_links')
    member_count = serializers.SerializerMethodField()

    def get_member_count(self, obj):
        return obj.members.count()

    class Meta:
        model = Team
        fields = ['id', 'name', 'source', 'member_count', 'created_at', 'updated_at', 'social_links']


class TeamDetailSerializer(serializers.ModelSerializer):
    social_links = TeamSocialLinkSerializer(many=True, read_only=True, source='team_social_links')
    tags = TeamTagSerializer(many=True, read_only=True, source='team_tags')
    notes = TeamNoteSerializer(many=True, read_only=True, source='team_notes')
    members = serializers.PrimaryKeyRelatedField(many=True, read_only=True)

    class Meta:
        model = Team
        fields = ['id', 'name', 'email', 'address', 'source', 'created_at', 'updated_at', 'social_links', 'tags', 'notes', 'members']


class TeamWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Team
        fields = ['id', 'name', 'email', 'address', 'source']

    def validate_source(self, value):
        if value not in dict(Team.Source.choices):
            raise serializers.ValidationError(f'Invalid source. Must be one of: {", ".join(dict(Team.Source.choices).keys())}')
        return value

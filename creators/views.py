from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import Creator, SocialLink, Tag, Note, Team, TeamSocialLink, TeamTag, TeamNote
from .serializers import (
    CreatorListSerializer,
    CreatorDetailSerializer,
    CreatorWriteSerializer,
    SocialLinkSerializer,
    TagSerializer,
    NoteSerializer,
    TeamListSerializer,
    TeamDetailSerializer,
    TeamWriteSerializer,
    TeamSocialLinkSerializer,
    TeamTagSerializer,
    TeamNoteSerializer,
)


class CreatorViewSet(viewsets.ModelViewSet):
    queryset = Creator.objects.all()

    def get_serializer_class(self):
        if self.action == 'list':
            return CreatorListSerializer
        if self.action == 'retrieve':
            return CreatorDetailSerializer
        return CreatorWriteSerializer

    def perform_create(self, serializer):
        serializer.save()

    @action(detail=True, methods=['get', 'post'])
    def social_links(self, request, pk=None):
        creator = self.get_object()
        if request.method == 'GET':
            links = creator.social_links.all()
            serializer = SocialLinkSerializer(links, many=True)
            return Response(serializer.data)
        elif request.method == 'POST':
            serializer = SocialLinkSerializer(data=request.data)
            if serializer.is_valid():
                if SocialLink.objects.filter(creator=creator, platform=request.data.get('platform')).exists():
                    return Response(
                        {'error': 'A social link with this platform already exists for this creator.'},
                        status=status.HTTP_400_BAD_REQUEST,
                    )
                serializer.save(creator=creator)
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['get', 'post'])
    def tags(self, request, pk=None):
        creator = self.get_object()
        if request.method == 'GET':
            tags = creator.tags.all()
            serializer = TagSerializer(tags, many=True)
            return Response(serializer.data)
        elif request.method == 'POST':
            serializer = TagSerializer(data=request.data)
            if serializer.is_valid():
                if Tag.objects.filter(creator=creator, key=request.data.get('key')).exists():
                    return Response(
                        {'error': 'A tag with this key already exists for this creator.'},
                        status=status.HTTP_400_BAD_REQUEST,
                    )
                serializer.save(creator=creator)
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['get', 'post'])
    def notes(self, request, pk=None):
        creator = self.get_object()
        if request.method == 'GET':
            notes = creator.notes.all()
            serializer = NoteSerializer(notes, many=True)
            return Response(serializer.data)
        elif request.method == 'POST':
            serializer = NoteSerializer(data=request.data)
            if serializer.is_valid():
                serializer.save(creator=creator)
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['delete'], url_path='social-links/(?P<link_id>[^/.]+)')
    def delete_social_link(self, request, pk=None, link_id=None):
        creator = self.get_object()
        link = get_object_or_404(SocialLink, id=link_id, creator=creator)
        link.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=True, methods=['put', 'delete'], url_path='tags/(?P<tag_id>[^/.]+)')
    def handle_tag(self, request, pk=None, tag_id=None):
        creator = self.get_object()
        tag = get_object_or_404(Tag, id=tag_id, creator=creator)
        if request.method == 'PUT':
            serializer = TagSerializer(tag, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        elif request.method == 'DELETE':
            tag.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=True, methods=['delete'], url_path='notes/(?P<note_id>[^/.]+)')
    def delete_note(self, request, pk=None, note_id=None):
        creator = self.get_object()
        note = get_object_or_404(Note, id=note_id, creator=creator)
        note.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class TeamViewSet(viewsets.ModelViewSet):
    queryset = Team.objects.all()

    def get_serializer_class(self):
        if self.action == 'list':
            return TeamListSerializer
        if self.action == 'retrieve':
            return TeamDetailSerializer
        return TeamWriteSerializer

    def perform_create(self, serializer):
        serializer.save()

    @action(detail=True, methods=['get', 'post', 'delete'])
    def members(self, request, pk=None):
        team = self.get_object()
        if request.method == 'GET':
            return Response([m.id for m in team.members.all()])
        creator_id = request.data.get('creator_id')
        creator = get_object_or_404(Creator, id=creator_id)
        if request.method == 'POST':
            team.members.add(creator)
            return Response({'status': 'member added'})
        elif request.method == 'DELETE':
            team.members.remove(creator)
            return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=True, methods=['get', 'post'])
    def social_links(self, request, pk=None):
        team = self.get_object()
        if request.method == 'GET':
            links = team.team_social_links.all()
            serializer = TeamSocialLinkSerializer(links, many=True)
            return Response(serializer.data)
        elif request.method == 'POST':
            serializer = TeamSocialLinkSerializer(data=request.data)
            if serializer.is_valid():
                if TeamSocialLink.objects.filter(team=team, platform=request.data.get('platform')).exists():
                    return Response(
                        {'error': 'A social link with this platform already exists for this team.'},
                        status=status.HTTP_400_BAD_REQUEST,
                    )
                serializer.save(team=team)
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['get', 'post'])
    def tags(self, request, pk=None):
        team = self.get_object()
        if request.method == 'GET':
            tags = team.team_tags.all()
            serializer = TeamTagSerializer(tags, many=True)
            return Response(serializer.data)
        elif request.method == 'POST':
            serializer = TeamTagSerializer(data=request.data)
            if serializer.is_valid():
                if TeamTag.objects.filter(team=team, key=request.data.get('key')).exists():
                    return Response(
                        {'error': 'A tag with this key already exists for this team.'},
                        status=status.HTTP_400_BAD_REQUEST,
                    )
                serializer.save(team=team)
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['get', 'post'])
    def notes(self, request, pk=None):
        team = self.get_object()
        if request.method == 'GET':
            notes = team.team_notes.all()
            serializer = TeamNoteSerializer(notes, many=True)
            return Response(serializer.data)
        elif request.method == 'POST':
            serializer = TeamNoteSerializer(data=request.data)
            if serializer.is_valid():
                serializer.save(team=team)
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['delete'], url_path='social-links/(?P<link_id>[^/.]+)')
    def delete_social_link(self, request, pk=None, link_id=None):
        team = self.get_object()
        link = get_object_or_404(TeamSocialLink, id=link_id, team=team)
        link.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=True, methods=['put', 'delete'], url_path='tags/(?P<tag_id>[^/.]+)')
    def handle_tag(self, request, pk=None, tag_id=None):
        team = self.get_object()
        tag = get_object_or_404(TeamTag, id=tag_id, team=team)
        if request.method == 'PUT':
            serializer = TeamTagSerializer(tag, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        elif request.method == 'DELETE':
            tag.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=True, methods=['delete'], url_path='notes/(?P<note_id>[^/.]+)')
    def delete_note(self, request, pk=None, note_id=None):
        team = self.get_object()
        note = get_object_or_404(TeamNote, id=note_id, team=team)
        note.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

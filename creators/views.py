from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404

from .models import Creator, SocialLink, Tag, Note
from .serializers import (
    CreatorListSerializer,
    CreatorDetailSerializer,
    CreatorWriteSerializer,
    SocialLinkSerializer,
    TagSerializer,
    NoteSerializer,
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

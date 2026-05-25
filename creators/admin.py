from django.contrib import admin
from .models import Creator, SocialLink, Tag, Note


class SocialLinkInline(admin.TabularInline):
    model = SocialLink
    extra = 1


class TagInline(admin.TabularInline):
    model = Tag
    extra = 1


class NoteInline(admin.TabularInline):
    model = Note
    extra = 1
    readonly_fields = ['created_at', 'updated_at']


@admin.register(Creator)
class CreatorAdmin(admin.ModelAdmin):
    list_display = ['name', 'username', 'email', 'source', 'created_at']
    list_filter = ['source']
    search_fields = ['name', 'username', 'email']
    inlines = [SocialLinkInline, TagInline, NoteInline]


@admin.register(SocialLink)
class SocialLinkAdmin(admin.ModelAdmin):
    list_display = ['platform', 'handle', 'creator', 'created_at']
    list_filter = ['platform']


@admin.register(Tag)
class TagAdmin(admin.ModelAdmin):
    list_display = ['key', 'value', 'creator', 'created_at']


@admin.register(Note)
class NoteAdmin(admin.ModelAdmin):
    list_display = ['content', 'creator', 'created_at']

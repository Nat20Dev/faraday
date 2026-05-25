from django.db import models


class Creator(models.Model):
    class Source(models.TextChoices):
        MANUAL_ENTRY = 'MANUAL_ENTRY', 'Manual Entry'
        EVENT = 'EVENT', 'Event'
        CAMPAIGN = 'CAMPAIGN', 'Campaign'

    name = models.CharField(max_length=255)
    username = models.CharField(max_length=255, unique=True)
    email = models.EmailField(null=True, blank=True)
    address = models.TextField(null=True, blank=True)
    source = models.CharField(max_length=20, choices=Source.choices, default=Source.MANUAL_ENTRY)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.name


class SocialLink(models.Model):
    class Platform(models.TextChoices):
        INSTAGRAM = 'INSTAGRAM', 'Instagram'
        TIKTOK = 'TIKTOK', 'TikTok'
        YOUTUBE = 'YOUTUBE', 'YouTube'
        TWITCH = 'TWITCH', 'Twitch'
        BLUESKY = 'BLUESKY', 'Bluesky'

    platform = models.CharField(max_length=20, choices=Platform.choices)
    url = models.URLField()
    handle = models.CharField(max_length=255, null=True, blank=True)
    creator = models.ForeignKey(Creator, on_delete=models.CASCADE, related_name='social_links')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ['creator', 'platform']

    def __str__(self):
        return f'{self.platform}: {self.handle or self.url}'


class Tag(models.Model):
    key = models.CharField(max_length=255)
    value = models.TextField(null=True, blank=True)
    creator = models.ForeignKey(Creator, on_delete=models.CASCADE, related_name='tags')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['creator', 'key']

    def __str__(self):
        return f'{self.key}: {self.value}'


class Note(models.Model):
    content = models.TextField()
    creator = models.ForeignKey(Creator, on_delete=models.CASCADE, related_name='notes')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.content[:50]


class Team(models.Model):
    class Source(models.TextChoices):
        MANUAL_ENTRY = 'MANUAL_ENTRY', 'Manual Entry'
        EVENT = 'EVENT', 'Event'
        CAMPAIGN = 'CAMPAIGN', 'Campaign'

    name = models.CharField(max_length=255)
    email = models.EmailField(null=True, blank=True)
    address = models.TextField(null=True, blank=True)
    source = models.CharField(max_length=20, choices=Source.choices, default=Source.MANUAL_ENTRY)
    members = models.ManyToManyField('Creator', related_name='teams', blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.name


class TeamSocialLink(models.Model):
    class Platform(models.TextChoices):
        INSTAGRAM = 'INSTAGRAM', 'Instagram'
        TIKTOK = 'TIKTOK', 'TikTok'
        YOUTUBE = 'YOUTUBE', 'YouTube'
        TWITCH = 'TWITCH', 'Twitch'
        BLUESKY = 'BLUESKY', 'Bluesky'

    platform = models.CharField(max_length=20, choices=Platform.choices)
    url = models.URLField()
    handle = models.CharField(max_length=255, null=True, blank=True)
    team = models.ForeignKey(Team, on_delete=models.CASCADE, related_name='team_social_links')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ['team', 'platform']

    def __str__(self):
        return f'{self.platform}: {self.handle or self.url}'


class TeamTag(models.Model):
    key = models.CharField(max_length=255)
    value = models.TextField(null=True, blank=True)
    team = models.ForeignKey(Team, on_delete=models.CASCADE, related_name='team_tags')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['team', 'key']

    def __str__(self):
        return f'{self.key}: {self.value}'


class TeamNote(models.Model):
    content = models.TextField()
    team = models.ForeignKey(Team, on_delete=models.CASCADE, related_name='team_notes')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.content[:50]

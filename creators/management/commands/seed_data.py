from django.core.management.base import BaseCommand
from creators.models import Creator, SocialLink, Tag, Note


SEED_CREATORS = [
    {
        "name": "Alice Chen",
        "username": "alicechen",
        "email": "alice@example.com",
        "address": "123 Main St, Los Angeles, CA 90001",
        "source": "MANUAL_ENTRY",
    },
    {
        "name": "Marcus Rivera",
        "username": "marcus_r",
        "email": "marcus@example.com",
        "address": "456 Oak Ave, Austin, TX 73301",
        "source": "EVENT",
    },
    {
        "name": "Yuki Tanaka",
        "username": "yuki_tanaka",
        "email": "yuki@example.com",
        "address": "789 Pine Rd, Seattle, WA 98101",
        "source": "CAMPAIGN",
    },
    {
        "name": "Sarah Johnson",
        "username": "sarahj",
        "email": "sarah@example.com",
        "source": "MANUAL_ENTRY",
    },
    {
        "name": "David Kim",
        "username": "davidkim",
        "source": "EVENT",
    },
    {
        "name": "Priya Sharma",
        "username": "priyasharma",
        "email": "priya@example.com",
        "address": "321 Elm St, Chicago, IL 60601",
        "source": "MANUAL_ENTRY",
    },
    {
        "name": "Liam O'Brien",
        "username": "liamob",
        "source": "CAMPAIGN",
    },
    {
        "name": "Emma Wilson",
        "username": "emmawilson",
        "email": "emma@example.com",
        "source": "MANUAL_ENTRY",
    },
]

SEED_SOCIAL_LINKS = [
    {"username": "alicechen", "platform": "INSTAGRAM", "url": "https://instagram.com/alicechen", "handle": "alicechen"},
    {"username": "alicechen", "platform": "TIKTOK", "url": "https://tiktok.com/@alicechen", "handle": "alicechen"},
    {"username": "alicechen", "platform": "YOUTUBE", "url": "https://youtube.com/@alicechen", "handle": "Alice Chen"},
    {"username": "marcus_r", "platform": "INSTAGRAM", "url": "https://instagram.com/marcus_r", "handle": "marcus_r"},
    {"username": "marcus_r", "platform": "TWITCH", "url": "https://twitch.tv/marcus_r", "handle": "marcus_r"},
    {"username": "yuki_tanaka", "platform": "INSTAGRAM", "url": "https://instagram.com/yuki_tanaka", "handle": "yuki_tanaka"},
    {"username": "yuki_tanaka", "platform": "YOUTUBE", "url": "https://youtube.com/@yuki_tanaka", "handle": "Yuki Tanaka"},
    {"username": "yuki_tanaka", "platform": "BLUESKY", "url": "https://bsky.app/profile/yuki_tanaka", "handle": "yuki_tanaka"},
    {"username": "sarahj", "platform": "INSTAGRAM", "url": "https://instagram.com/sarahj", "handle": "sarahj"},
    {"username": "sarahj", "platform": "TIKTOK", "url": "https://tiktok.com/@sarahj", "handle": "sarahj"},
    {"username": "davidkim", "platform": "YOUTUBE", "url": "https://youtube.com/@davidkim", "handle": "David Kim"},
    {"username": "davidkim", "platform": "TWITCH", "url": "https://twitch.tv/davidkim", "handle": "davidkim"},
    {"username": "priyasharma", "platform": "INSTAGRAM", "url": "https://instagram.com/priyasharma", "handle": "priyasharma"},
    {"username": "priyasharma", "platform": "BLUESKY", "url": "https://bsky.app/profile/priyasharma", "handle": "priyasharma"},
    {"username": "liamob", "platform": "TIKTOK", "url": "https://tiktok.com/@liamob", "handle": "liamob"},
    {"username": "liamob", "platform": "YOUTUBE", "url": "https://youtube.com/@liamob", "handle": "Liam O'Brien"},
    {"username": "emmawilson", "platform": "INSTAGRAM", "url": "https://instagram.com/emmawilson", "handle": "emmawilson"},
    {"username": "emmawilson", "platform": "TWITCH", "url": "https://twitch.tv/emmawilson", "handle": "emmawilson"},
]

SEED_TAGS = [
    {"username": "alicechen", "key": "tier", "value": "gold"},
    {"username": "alicechen", "key": "niche", "value": "gaming"},
    {"username": "marcus_r", "key": "tier", "value": "silver"},
    {"username": "marcus_r", "key": "niche", "value": "tech"},
    {"username": "yuki_tanaka", "key": "tier", "value": "platinum"},
    {"username": "yuki_tanaka", "key": "niche", "value": "music"},
    {"username": "sarahj", "key": "tier", "value": "silver"},
    {"username": "davidkim", "key": "tier", "value": "gold"},
    {"username": "davidkim", "key": "niche", "value": "fitness"},
    {"username": "priyasharma", "key": "tier", "value": "gold"},
    {"username": "priyasharma", "key": "niche", "value": "fashion"},
    {"username": "liamob", "key": "tier", "value": "silver"},
    {"username": "liamob", "key": "niche", "value": "comedy"},
    {"username": "emmawilson", "key": "tier", "value": "bronze"},
    {"username": "emmawilson", "key": "niche", "value": "lifestyle"},
]

SEED_NOTES = [
    {"username": "alicechen", "content": "Met at Gamescom 2025. Very enthusiastic about partnership."},
    {"username": "alicechen", "content": "Sent contract draft on 2026-01-15. Awaiting signature."},
    {"username": "marcus_r", "content": "Reached out via LinkedIn. Tech reviewer with 200K subscribers."},
    {"username": "yuki_tanaka", "content": "Existing partner from previous campaign. Renewal discussion next month."},
    {"username": "yuki_tanaka", "content": "Prefers email communication. Timezone: JST (UTC+9)."},
    {"username": "sarahj", "content": "Lifestyle creator focused on sustainable fashion. Good brand fit."},
    {"username": "davidkim", "content": "Fitness influencer. Currently in negotiation phase."},
    {"username": "priyasharma", "content": "Fashion blogger with strong engagement on Instagram."},
    {"username": "priyasharma", "content": "Requested product samples on 2026-02-01. Sent."},
    {"username": "liamob", "content": "Comedy skit creator. Viral potential is high."},
    {"username": "emmawilson", "content": "New creator, just onboarded. Needs onboarding materials."},
]


class Command(BaseCommand):
    help = "Seeds the database with synthetic test data"

    def handle(self, *args, **options):
        self._seed_creators()
        self._seed_social_links()
        self._seed_tags()
        self._seed_notes()
        self.stdout.write(self.style.SUCCESS(f"Seeded {Creator.objects.count()} creators with social links, tags, and notes."))

    def _seed_creators(self):
        for data in SEED_CREATORS:
            Creator.objects.get_or_create(username=data["username"], defaults=data)
        self.stdout.write(f"  ✓ Created {len(SEED_CREATORS)} creators")

    def _seed_social_links(self):
        count = 0
        for data in SEED_SOCIAL_LINKS:
            creator = Creator.objects.get(username=data["username"])
            _, created = SocialLink.objects.get_or_create(
                creator=creator,
                platform=data["platform"],
                defaults={"url": data["url"], "handle": data["handle"]},
            )
            if created:
                count += 1
        self.stdout.write(f"  ✓ Created {count} social links")

    def _seed_tags(self):
        count = 0
        for data in SEED_TAGS:
            creator = Creator.objects.get(username=data["username"])
            _, created = Tag.objects.get_or_create(
                creator=creator,
                key=data["key"],
                defaults={"value": data["value"]},
            )
            if created:
                count += 1
        self.stdout.write(f"  ✓ Created {count} tags")

    def _seed_notes(self):
        count = 0
        for data in SEED_NOTES:
            creator = Creator.objects.get(username=data["username"])
            Note.objects.create(creator=creator, content=data["content"])
            count += 1
        self.stdout.write(f"  ✓ Created {count} notes")

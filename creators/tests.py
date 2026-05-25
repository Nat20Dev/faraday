from django.test import TestCase
from rest_framework import status
from rest_framework.test import APITestCase
from django.urls import reverse

from .models import Creator, SocialLink, Tag, Note


class CreatorModelTests(TestCase):
    def test_create_creator(self):
        creator = Creator.objects.create(name="Alice", username="alice")
        self.assertEqual(creator.name, "Alice")
        self.assertEqual(creator.username, "alice")
        self.assertEqual(creator.source, Creator.Source.MANUAL_ENTRY)
        self.assertIsNone(creator.email)
        self.assertIsNone(creator.address)

    def test_creator_str(self):
        creator = Creator.objects.create(name="Bob", username="bob")
        self.assertEqual(str(creator), "Bob")

    def test_creator_ordering(self):
        c1 = Creator.objects.create(name="A", username="a")
        c2 = Creator.objects.create(name="B", username="b")
        self.assertEqual(list(Creator.objects.all()), [c2, c1])

    def test_unique_username(self):
        Creator.objects.create(name="Alice", username="alice")
        with self.assertRaises(Exception):
            Creator.objects.create(name="Alice2", username="alice")


class SocialLinkModelTests(TestCase):
    def setUp(self):
        self.creator = Creator.objects.create(name="Alice", username="alice")

    def test_create_social_link(self):
        link = SocialLink.objects.create(
            creator=self.creator,
            platform=SocialLink.Platform.INSTAGRAM,
            url="https://instagram.com/alice",
            handle="alice",
        )
        self.assertEqual(link.platform, "INSTAGRAM")
        self.assertEqual(link.handle, "alice")

    def test_social_link_str(self):
        link = SocialLink.objects.create(
            creator=self.creator,
            platform=SocialLink.Platform.TIKTOK,
            url="https://tiktok.com/@alice",
            handle="alice",
        )
        expected = f"{link.platform}: {link.handle}"
        self.assertEqual(str(link), expected)

    def test_unique_platform_per_creator(self):
        SocialLink.objects.create(
            creator=self.creator,
            platform=SocialLink.Platform.INSTAGRAM,
            url="https://instagram.com/alice",
        )
        with self.assertRaises(Exception):
            SocialLink.objects.create(
                creator=self.creator,
                platform=SocialLink.Platform.INSTAGRAM,
                url="https://instagram.com/alice2",
            )

    def test_cascade_delete(self):
        SocialLink.objects.create(
            creator=self.creator,
            platform=SocialLink.Platform.INSTAGRAM,
            url="https://instagram.com/alice",
        )
        self.creator.delete()
        self.assertEqual(SocialLink.objects.count(), 0)


class TagModelTests(TestCase):
    def setUp(self):
        self.creator = Creator.objects.create(name="Alice", username="alice")

    def test_create_tag(self):
        tag = Tag.objects.create(creator=self.creator, key="tier", value="gold")
        self.assertEqual(tag.key, "tier")
        self.assertEqual(tag.value, "gold")

    def test_tag_str(self):
        tag = Tag.objects.create(creator=self.creator, key="tier", value="gold")
        self.assertEqual(str(tag), "tier: gold")

    def test_unique_key_per_creator(self):
        Tag.objects.create(creator=self.creator, key="tier", value="gold")
        with self.assertRaises(Exception):
            Tag.objects.create(creator=self.creator, key="tier", value="silver")


class NoteModelTests(TestCase):
    def setUp(self):
        self.creator = Creator.objects.create(name="Alice", username="alice")

    def test_create_note(self):
        note = Note.objects.create(creator=self.creator, content="Test note")
        self.assertEqual(note.content, "Test note")

    def test_note_str(self):
        note = Note.objects.create(creator=self.creator, content="A" * 60)
        self.assertEqual(str(note), "A" * 50)

    def test_note_ordering(self):
        n1 = Note.objects.create(creator=self.creator, content="First")
        n2 = Note.objects.create(creator=self.creator, content="Second")
        self.assertEqual(list(Note.objects.all()), [n2, n1])


class CreatorAPITests(APITestCase):
    def setUp(self):
        self.list_url = reverse("creator-list")

    def test_list_empty(self):
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json(), [])

    def test_create_creator(self):
        data = {"name": "Alice", "username": "alice", "email": "alice@example.com"}
        response = self.client.post(self.list_url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.json()["name"], "Alice")
        self.assertEqual(response.json()["username"], "alice")
        self.assertEqual(Creator.objects.count(), 1)

    def test_create_creator_missing_name(self):
        data = {"username": "alice"}
        response = self.client.post(self.list_url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_create_creator_missing_username(self):
        data = {"name": "Alice"}
        response = self.client.post(self.list_url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_create_creator_invalid_source(self):
        data = {"name": "Alice", "username": "alice", "source": "INVALID"}
        response = self.client.post(self.list_url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_retrieve_creator(self):
        creator = Creator.objects.create(name="Alice", username="alice")
        url = reverse("creator-detail", args=[creator.id])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json()["name"], "Alice")

    def test_retrieve_nonexistent(self):
        url = reverse("creator-detail", args=[9999])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_update_creator(self):
        creator = Creator.objects.create(name="Alice", username="alice")
        url = reverse("creator-detail", args=[creator.id])
        data = {"name": "Alice Updated", "username": "alice"}
        response = self.client.put(url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json()["name"], "Alice Updated")

    def test_delete_creator(self):
        creator = Creator.objects.create(name="Alice", username="alice")
        url = reverse("creator-detail", args=[creator.id])
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Creator.objects.count(), 0)

    def test_list_multiple(self):
        Creator.objects.create(name="Alice", username="alice")
        Creator.objects.create(name="Bob", username="bob")
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.json()), 2)

    def test_detail_includes_relations(self):
        creator = Creator.objects.create(name="Alice", username="alice")
        SocialLink.objects.create(
            creator=creator,
            platform=SocialLink.Platform.INSTAGRAM,
            url="https://instagram.com/alice",
        )
        Tag.objects.create(creator=creator, key="tier", value="gold")
        Note.objects.create(creator=creator, content="Test note")
        url = reverse("creator-detail", args=[creator.id])
        response = self.client.get(url)
        self.assertIn("social_links", response.json())
        self.assertIn("tags", response.json())
        self.assertIn("notes", response.json())
        self.assertEqual(len(response.json()["social_links"]), 1)
        self.assertEqual(len(response.json()["tags"]), 1)
        self.assertEqual(len(response.json()["notes"]), 1)

    def test_list_excludes_address(self):
        Creator.objects.create(name="Alice", username="alice", address="123 Main St")
        response = self.client.get(self.list_url)
        self.assertNotIn("address", response.json()[0])


class SocialLinkAPITests(APITestCase):
    def setUp(self):
        self.creator = Creator.objects.create(name="Alice", username="alice")

    def test_list_social_links_empty(self):
        url = reverse("creator-social-links", args=[self.creator.id])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json(), [])

    def test_create_social_link(self):
        url = reverse("creator-social-links", args=[self.creator.id])
        data = {
            "platform": "INSTAGRAM",
            "url": "https://instagram.com/alice",
            "handle": "alice",
        }
        response = self.client.post(url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.json()["platform"], "INSTAGRAM")

    def test_create_social_link_invalid_platform(self):
        url = reverse("creator-social-links", args=[self.creator.id])
        data = {"platform": "INVALID", "url": "https://example.com"}
        response = self.client.post(url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_create_social_link_duplicate_platform(self):
        url = reverse("creator-social-links", args=[self.creator.id])
        data = {
            "platform": "INSTAGRAM",
            "url": "https://instagram.com/alice",
        }
        self.client.post(url, data, format="json")
        response = self.client.post(url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_delete_social_link(self):
        link = SocialLink.objects.create(
            creator=self.creator,
            platform=SocialLink.Platform.INSTAGRAM,
            url="https://instagram.com/alice",
        )
        url = reverse("creator-delete-social-link", args=[self.creator.id, link.id])
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(SocialLink.objects.count(), 0)

    def test_delete_social_link_nonexistent(self):
        url = reverse("creator-delete-social-link", args=[self.creator.id, 9999])
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_all_platforms(self):
        url = reverse("creator-social-links", args=[self.creator.id])
        for platform in ["INSTAGRAM", "TIKTOK", "YOUTUBE", "TWITCH", "BLUESKY"]:
            data = {"platform": platform, "url": f"https://{platform.lower()}.com/test"}
            response = self.client.post(url, data, format="json")
            self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(SocialLink.objects.count(), 5)


class TagAPITests(APITestCase):
    def setUp(self):
        self.creator = Creator.objects.create(name="Alice", username="alice")

    def test_list_tags_empty(self):
        url = reverse("creator-tags", args=[self.creator.id])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json(), [])

    def test_create_tag(self):
        url = reverse("creator-tags", args=[self.creator.id])
        data = {"key": "tier", "value": "gold"}
        response = self.client.post(url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.json()["key"], "tier")
        self.assertEqual(response.json()["value"], "gold")

    def test_update_tag(self):
        tag = Tag.objects.create(creator=self.creator, key="tier", value="gold")
        url = reverse("creator-handle-tag", args=[self.creator.id, tag.id])
        data = {"value": "platinum"}
        response = self.client.put(url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json()["value"], "platinum")

    def test_delete_tag(self):
        tag = Tag.objects.create(creator=self.creator, key="tier", value="gold")
        url = reverse("creator-handle-tag", args=[self.creator.id, tag.id])
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Tag.objects.count(), 0)

    def test_duplicate_key(self):
        url = reverse("creator-tags", args=[self.creator.id])
        data = {"key": "tier", "value": "gold"}
        self.client.post(url, data, format="json")
        response = self.client.post(url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class NoteAPITests(APITestCase):
    def setUp(self):
        self.creator = Creator.objects.create(name="Alice", username="alice")

    def test_list_notes_empty(self):
        url = reverse("creator-notes", args=[self.creator.id])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json(), [])

    def test_create_note(self):
        url = reverse("creator-notes", args=[self.creator.id])
        data = {"content": "Test note content"}
        response = self.client.post(url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.json()["content"], "Test note content")

    def test_create_note_empty_content(self):
        url = reverse("creator-notes", args=[self.creator.id])
        data = {"content": ""}
        response = self.client.post(url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_notes_reverse_chronological(self):
        url = reverse("creator-notes", args=[self.creator.id])
        self.client.post(url, {"content": "First"}, format="json")
        self.client.post(url, {"content": "Second"}, format="json")
        response = self.client.get(url)
        self.assertEqual(response.json()[0]["content"], "Second")
        self.assertEqual(response.json()[1]["content"], "First")

    def test_delete_note(self):
        note = Note.objects.create(creator=self.creator, content="Test")
        url = reverse("creator-delete-note", args=[self.creator.id, note.id])
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Note.objects.count(), 0)

    def test_delete_note_nonexistent(self):
        url = reverse("creator-delete-note", args=[self.creator.id, 9999])
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_cascade_delete_creator(self):
        Note.objects.create(creator=self.creator, content="Test")
        self.creator.delete()
        self.assertEqual(Note.objects.count(), 0)


class CrossCreatorIsolationTests(APITestCase):
    def test_social_links_isolation(self):
        c1 = Creator.objects.create(name="Alice", username="alice")
        c2 = Creator.objects.create(name="Bob", username="bob")
        SocialLink.objects.create(
            creator=c1,
            platform=SocialLink.Platform.INSTAGRAM,
            url="https://instagram.com/alice",
        )
        url = reverse("creator-social-links", args=[c2.id])
        response = self.client.get(url)
        self.assertEqual(len(response.json()), 0)

    def test_tags_isolation(self):
        c1 = Creator.objects.create(name="Alice", username="alice")
        c2 = Creator.objects.create(name="Bob", username="bob")
        Tag.objects.create(creator=c1, key="tier", value="gold")
        url = reverse("creator-tags", args=[c2.id])
        response = self.client.get(url)
        self.assertEqual(len(response.json()), 0)

    def test_notes_isolation(self):
        c1 = Creator.objects.create(name="Alice", username="alice")
        c2 = Creator.objects.create(name="Bob", username="bob")
        Note.objects.create(creator=c1, content="Note for Alice")
        url = reverse("creator-notes", args=[c2.id])
        response = self.client.get(url)
        self.assertEqual(len(response.json()), 0)

from django.test import TestCase
from rest_framework import status
from rest_framework.test import APITestCase
from django.urls import reverse

from .models import Creator, SocialLink, Tag, Note, Team, TeamSocialLink, TeamTag, TeamNote


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

    def test_detail_includes_teams(self):
        creator = Creator.objects.create(name="Alice", username="alice")
        team = Team.objects.create(name="Brand Team")
        team.members.add(creator)
        url = reverse("creator-detail", args=[creator.id])
        response = self.client.get(url)
        self.assertIn("teams", response.json())
        self.assertEqual(len(response.json()["teams"]), 1)
        self.assertEqual(response.json()["teams"][0]["id"], team.id)
        self.assertEqual(response.json()["teams"][0]["name"], "Brand Team")


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

    def test_update_note(self):
        note = Note.objects.create(creator=self.creator, content="Original")
        url = reverse("creator-handle-note", args=[self.creator.id, note.id])
        data = {"content": "Updated"}
        response = self.client.put(url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json()["content"], "Updated")
        note.refresh_from_db()
        self.assertEqual(note.content, "Updated")

    def test_update_note_nonexistent(self):
        url = reverse("creator-handle-note", args=[self.creator.id, 9999])
        data = {"content": "Updated"}
        response = self.client.put(url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_delete_note(self):
        note = Note.objects.create(creator=self.creator, content="Test")
        url = reverse("creator-handle-note", args=[self.creator.id, note.id])
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Note.objects.count(), 0)

    def test_delete_note_nonexistent(self):
        url = reverse("creator-handle-note", args=[self.creator.id, 9999])
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


class TeamModelTests(TestCase):
    def test_create_team(self):
        team = Team.objects.create(name="Marketing Team")
        self.assertEqual(team.name, "Marketing Team")
        self.assertEqual(team.source, Team.Source.MANUAL_ENTRY)
        self.assertIsNone(team.email)
        self.assertIsNone(team.address)

    def test_team_str(self):
        team = Team.objects.create(name="PR Team")
        self.assertEqual(str(team), "PR Team")

    def test_team_members(self):
        team = Team.objects.create(name="Content Team")
        c1 = Creator.objects.create(name="Alice", username="alice")
        c2 = Creator.objects.create(name="Bob", username="bob")
        team.members.add(c1, c2)
        self.assertEqual(team.members.count(), 2)

    def test_team_ordering(self):
        t1 = Team.objects.create(name="Team A")
        t2 = Team.objects.create(name="Team B")
        self.assertEqual(list(Team.objects.all()), [t2, t1])


class TeamSocialLinkModelTests(TestCase):
    def setUp(self):
        self.team = Team.objects.create(name="Marketing Team")

    def test_create_team_social_link(self):
        link = TeamSocialLink.objects.create(
            team=self.team,
            platform=TeamSocialLink.Platform.INSTAGRAM,
            url="https://instagram.com/team",
            handle="team_handle",
        )
        self.assertEqual(link.platform, "INSTAGRAM")
        self.assertEqual(link.handle, "team_handle")

    def test_unique_platform_per_team(self):
        TeamSocialLink.objects.create(
            team=self.team,
            platform=TeamSocialLink.Platform.INSTAGRAM,
            url="https://instagram.com/team",
        )
        with self.assertRaises(Exception):
            TeamSocialLink.objects.create(
                team=self.team,
                platform=TeamSocialLink.Platform.INSTAGRAM,
                url="https://instagram.com/team2",
            )

    def test_cascade_delete(self):
        TeamSocialLink.objects.create(
            team=self.team,
            platform=TeamSocialLink.Platform.INSTAGRAM,
            url="https://instagram.com/team",
        )
        self.team.delete()
        self.assertEqual(TeamSocialLink.objects.count(), 0)


class TeamTagModelTests(TestCase):
    def setUp(self):
        self.team = Team.objects.create(name="Marketing Team")

    def test_create_team_tag(self):
        tag = TeamTag.objects.create(team=self.team, key="department", value="marketing")
        self.assertEqual(tag.key, "department")
        self.assertEqual(tag.value, "marketing")

    def test_unique_key_per_team(self):
        TeamTag.objects.create(team=self.team, key="department", value="marketing")
        with self.assertRaises(Exception):
            TeamTag.objects.create(team=self.team, key="department", value="sales")


class TeamNoteModelTests(TestCase):
    def setUp(self):
        self.team = Team.objects.create(name="Marketing Team")

    def test_create_team_note(self):
        note = TeamNote.objects.create(team=self.team, content="Important note")
        self.assertEqual(note.content, "Important note")

    def test_ordering(self):
        n1 = TeamNote.objects.create(team=self.team, content="First")
        n2 = TeamNote.objects.create(team=self.team, content="Second")
        self.assertEqual(list(TeamNote.objects.all()), [n2, n1])


class TeamAPITests(APITestCase):
    def setUp(self):
        self.list_url = reverse("team-list")

    def test_list_empty(self):
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json(), [])

    def test_create_team(self):
        data = {"name": "Marketing Team"}
        response = self.client.post(self.list_url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.json()["name"], "Marketing Team")
        self.assertEqual(Team.objects.count(), 1)

    def test_create_team_missing_name(self):
        data = {}
        response = self.client.post(self.list_url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_retrieve_team(self):
        team = Team.objects.create(name="Marketing Team")
        url = reverse("team-detail", args=[team.id])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json()["name"], "Marketing Team")

    def test_retrieve_nonexistent(self):
        url = reverse("team-detail", args=[9999])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_update_team(self):
        team = Team.objects.create(name="Marketing Team")
        url = reverse("team-detail", args=[team.id])
        data = {"name": "Marketing Team Updated"}
        response = self.client.put(url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json()["name"], "Marketing Team Updated")

    def test_delete_team(self):
        team = Team.objects.create(name="Marketing Team")
        url = reverse("team-detail", args=[team.id])
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Team.objects.count(), 0)

    def test_detail_includes_members(self):
        team = Team.objects.create(name="Marketing Team")
        creator = Creator.objects.create(name="Alice", username="alice")
        team.members.add(creator)
        url = reverse("team-detail", args=[team.id])
        response = self.client.get(url)
        self.assertIn("members", response.json())
        self.assertIn(creator.id, response.json()["members"])

    def test_list_includes_member_count(self):
        team = Team.objects.create(name="Marketing Team")
        creator = Creator.objects.create(name="Alice", username="alice")
        team.members.add(creator)
        response = self.client.get(self.list_url)
        self.assertIn("member_count", response.json()[0])
        self.assertEqual(response.json()[0]["member_count"], 1)


class TeamSocialLinkAPITests(APITestCase):
    def setUp(self):
        self.team = Team.objects.create(name="Marketing Team")

    def test_list_empty(self):
        url = reverse("team-social-links", args=[self.team.id])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json(), [])

    def test_create(self):
        url = reverse("team-social-links", args=[self.team.id])
        data = {
            "platform": "INSTAGRAM",
            "url": "https://instagram.com/team",
            "handle": "team_handle",
        }
        response = self.client.post(url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.json()["platform"], "INSTAGRAM")

    def test_invalid_platform(self):
        url = reverse("team-social-links", args=[self.team.id])
        data = {"platform": "INVALID", "url": "https://example.com"}
        response = self.client.post(url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_duplicate(self):
        url = reverse("team-social-links", args=[self.team.id])
        data = {
            "platform": "INSTAGRAM",
            "url": "https://instagram.com/team",
        }
        self.client.post(url, data, format="json")
        response = self.client.post(url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_delete(self):
        link = TeamSocialLink.objects.create(
            team=self.team,
            platform=TeamSocialLink.Platform.INSTAGRAM,
            url="https://instagram.com/team",
        )
        url = reverse("team-delete-social-link", args=[self.team.id, link.id])
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(TeamSocialLink.objects.count(), 0)

    def test_delete_nonexistent(self):
        url = reverse("team-delete-social-link", args=[self.team.id, 9999])
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)


class TeamTagAPITests(APITestCase):
    def setUp(self):
        self.team = Team.objects.create(name="Marketing Team")

    def test_list_empty(self):
        url = reverse("team-tags", args=[self.team.id])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json(), [])

    def test_create(self):
        url = reverse("team-tags", args=[self.team.id])
        data = {"key": "department", "value": "marketing"}
        response = self.client.post(url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.json()["key"], "department")
        self.assertEqual(response.json()["value"], "marketing")

    def test_update(self):
        tag = TeamTag.objects.create(team=self.team, key="department", value="marketing")
        url = reverse("team-handle-tag", args=[self.team.id, tag.id])
        data = {"value": "sales"}
        response = self.client.put(url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json()["value"], "sales")

    def test_delete(self):
        tag = TeamTag.objects.create(team=self.team, key="department", value="marketing")
        url = reverse("team-handle-tag", args=[self.team.id, tag.id])
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(TeamTag.objects.count(), 0)

    def test_duplicate_key(self):
        url = reverse("team-tags", args=[self.team.id])
        data = {"key": "department", "value": "marketing"}
        self.client.post(url, data, format="json")
        response = self.client.post(url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class TeamNoteAPITests(APITestCase):
    def setUp(self):
        self.team = Team.objects.create(name="Marketing Team")

    def test_list_empty(self):
        url = reverse("team-notes", args=[self.team.id])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json(), [])

    def test_create(self):
        url = reverse("team-notes", args=[self.team.id])
        data = {"content": "Important team note"}
        response = self.client.post(url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.json()["content"], "Important team note")

    def test_ordering(self):
        url = reverse("team-notes", args=[self.team.id])
        self.client.post(url, {"content": "First"}, format="json")
        self.client.post(url, {"content": "Second"}, format="json")
        response = self.client.get(url)
        self.assertEqual(response.json()[0]["content"], "Second")
        self.assertEqual(response.json()[1]["content"], "First")

    def test_update_team_note(self):
        note = TeamNote.objects.create(team=self.team, content="Original")
        url = reverse("team-handle-note", args=[self.team.id, note.id])
        data = {"content": "Updated"}
        response = self.client.put(url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json()["content"], "Updated")
        note.refresh_from_db()
        self.assertEqual(note.content, "Updated")

    def test_update_team_note_nonexistent(self):
        url = reverse("team-handle-note", args=[self.team.id, 9999])
        data = {"content": "Updated"}
        response = self.client.put(url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_delete(self):
        note = TeamNote.objects.create(team=self.team, content="Test")
        url = reverse("team-handle-note", args=[self.team.id, note.id])
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(TeamNote.objects.count(), 0)

    def test_delete_nonexistent(self):
        url = reverse("team-handle-note", args=[self.team.id, 9999])
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)


class TeamMembersAPITests(APITestCase):
    def setUp(self):
        self.team = Team.objects.create(name="Marketing Team")
        self.creator = Creator.objects.create(name="Alice", username="alice")
        self.url = reverse("team-members", args=[self.team.id])

    def test_add_member(self):
        response = self.client.post(self.url, {"creator_id": self.creator.id}, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn(self.creator.id, self.team.members.all().values_list("id", flat=True))

    def test_add_member_twice(self):
        self.team.members.add(self.creator)
        response = self.client.post(self.url, {"creator_id": self.creator.id}, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(self.team.members.count(), 1)

    def test_remove_member(self):
        self.team.members.add(self.creator)
        response = self.client.delete(self.url, {"creator_id": self.creator.id}, format="json")
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(self.team.members.count(), 0)

    def test_remove_member_not_in_team(self):
        response = self.client.delete(self.url, {"creator_id": self.creator.id}, format="json")
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(self.team.members.count(), 0)

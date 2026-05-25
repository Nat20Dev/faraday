from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CreatorViewSet, TeamViewSet

router = DefaultRouter()
router.register(r'creators', CreatorViewSet)
router.register(r'teams', TeamViewSet)

urlpatterns = [
    path('', include(router.urls)),
]

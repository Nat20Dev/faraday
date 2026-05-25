from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CreatorViewSet

router = DefaultRouter()
router.register(r'creators', CreatorViewSet)

urlpatterns = [
    path('', include(router.urls)),
]

"""
Peer Collaboration System for LearnInSlices
Implements real-time study rooms, peer challenges, and social learning

Key Features:
- Virtual study rooms for collaborative learning
- Real-time peer interactions and messaging
- Peer challenges and competitions
- Study group management
- Knowledge sharing and peer review
- Mentorship and guidance systems
"""

from enum import Enum
from typing import Dict, List, Optional, Set
from datetime import datetime, timezone, timedelta
from dataclasses import dataclass
import json
import asyncio
import logging

from sqlalchemy import (
    Column, Integer, String, DateTime, Boolean, Text, 
    ForeignKey, Table, Float
)
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base

# Real-time communication (would integrate with FastAPI WebSockets)
try:
    import websockets
    WEBSOCKETS_AVAILABLE = True
except ImportError:
    WEBSOCKETS_AVAILABLE = False


class RoomType(Enum):
    """Types of study rooms"""
    OPEN_STUDY = "open_study"
    PRIVATE_GROUP = "private_group"
    CHALLENGE_ROOM = "challenge_room"
    MENTOR_SESSION = "mentor_session"
    TOPIC_FOCUSED = "topic_focused"


class ChallengeType(Enum):
    """Types of peer challenges"""
    SPEED_CHALLENGE = "speed_challenge"
    ACCURACY_CHALLENGE = "accuracy_challenge"
    KNOWLEDGE_DUEL = "knowledge_duel"
    TEAM_QUEST = "team_quest"
    STREAK_COMPETITION = "streak_competition"


class MessageType(Enum):
    """Types of real-time messages"""
    CHAT = "chat"
    SYSTEM = "system"
    LEARNING_UPDATE = "learning_update"
    CHALLENGE_PROGRESS = "challenge_progress"
    PEER_HELP_REQUEST = "peer_help_request"
    CELEBRATION = "celebration"


@dataclass
class StudySession:
    """Real-time study session data"""
    session_id: str
    room_id: int
    participants: List[int]
    start_time: datetime
    activity_type: str
    session_data: Dict


class CollaborationModels:
    """Database models for peer collaboration"""
    
    Base = declarative_base()
    
    # Association table for room participants
    room_participants = Table(
        'room_participants',
        Base.metadata,
        Column('room_id', Integer, ForeignKey('study_rooms.id')),
        Column('user_id', Integer, ForeignKey('users.id')),
        Column('joined_at', DateTime(timezone=True), default=datetime.utcnow),
        Column('role', String(50), default='participant')  # participant, moderator, mentor
    )
    
    class StudyRoom(Base):
        """Virtual study rooms for collaborative learning"""
        __tablename__ = "study_rooms"
        
        id = Column(Integer, primary_key=True, index=True)
        
        # Room configuration
        name = Column(String(100))
        description = Column(Text)
        room_type = Column(String(50))  # RoomType enum
        topic = Column(String(100))
        
        # Access control
        is_public = Column(Boolean, default=True)
        password_hash = Column(String(255))  # For private rooms
        max_participants = Column(Integer, default=10)
        
        # Room state
        is_active = Column(Boolean, default=True)
        current_participants = Column(Integer, default=0)
        
        # Creator and management
        creator_id = Column(Integer, ForeignKey("users.id"))
        created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
        last_activity = Column(DateTime(timezone=True), default=datetime.utcnow)
        
        # Room settings
        settings = Column(Text)  # JSON room configuration
        
        # Relationships
        participants = relationship("User", secondary=room_participants, back_populates="study_rooms")
        messages = relationship("RoomMessage", back_populates="room")
        sessions = relationship("CollaborativeSession", back_populates="room")
    
    class RoomMessage(Base):
        """Messages in study rooms"""
        __tablename__ = "room_messages"
        
        id = Column(Integer, primary_key=True, index=True)
        room_id = Column(Integer, ForeignKey("study_rooms.id"))
        user_id = Column(Integer, ForeignKey("users.id"))
        
        # Message content
        message_type = Column(String(50))  # MessageType enum
        content = Column(Text)
        metadata = Column(Text)  # JSON additional data
        
        # Threading support
        reply_to_id = Column(Integer, ForeignKey("room_messages.id"))
        thread_count = Column(Integer, default=0)
        
        # Message state
        is_edited = Column(Boolean, default=False)
        is_deleted = Column(Boolean, default=False)
        
        created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
        updated_at = Column(DateTime(timezone=True), default=datetime.utcnow)
        
        # Relationships
        room = relationship("StudyRoom", back_populates="messages")
        user = relationship("User")
        replies = relationship("RoomMessage", remote_side=[id])
    
    class PeerChallenge(Base):
        """Peer-to-peer learning challenges"""
        __tablename__ = "peer_challenges"
        
        id = Column(Integer, primary_key=True, index=True)
        
        # Challenge setup
        challenge_type = Column(String(50))  # ChallengeType enum
        name = Column(String(100))
        description = Column(Text)
        
        # Participants
        challenger_id = Column(Integer, ForeignKey("users.id"))
        challenged_id = Column(Integer, ForeignKey("users.id"))
        room_id = Column(Integer, ForeignKey("study_rooms.id"))
        
        # Challenge parameters
        topic = Column(String(100))
        difficulty_level = Column(String(50))
        time_limit_minutes = Column(Integer)
        target_score = Column(Integer)
        
        # Challenge state
        status = Column(String(50), default="pending")  # pending, active, completed, cancelled
        winner_id = Column(Integer, ForeignKey("users.id"))
        
        # Results
        challenger_score = Column(Integer, default=0)
        challenged_score = Column(Integer, default=0)
        challenge_data = Column(Text)  # JSON results and metrics
        
        # Timing
        created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
        started_at = Column(DateTime(timezone=True))
        completed_at = Column(DateTime(timezone=True))
        
        # Relationships
        challenger = relationship("User", foreign_keys=[challenger_id])
        challenged = relationship("User", foreign_keys=[challenged_id])
        winner = relationship("User", foreign_keys=[winner_id])
        room = relationship("StudyRoom")
    
    class StudyGroup(Base):
        """Persistent study groups"""
        __tablename__ = "study_groups"
        
        id = Column(Integer, primary_key=True, index=True)
        
        # Group information
        name = Column(String(100))
        description = Column(Text)
        topic = Column(String(100))
        
        # Group management
        creator_id = Column(Integer, ForeignKey("users.id"))
        member_count = Column(Integer, default=1)
        max_members = Column(Integer, default=20)
        
        # Group settings
        is_public = Column(Boolean, default=True)
        requires_approval = Column(Boolean, default=False)
        
        # Activity tracking
        total_study_time = Column(Integer, default=0)  # Total minutes
        group_level = Column(Integer, default=1)
        group_xp = Column(Integer, default=0)
        
        created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
        last_activity = Column(DateTime(timezone=True), default=datetime.utcnow)
        
        # Relationships
        creator = relationship("User", foreign_keys=[creator_id])
        members = relationship("StudyGroupMember", back_populates="group")
    
    class StudyGroupMember(Base):
        """Study group membership"""
        __tablename__ = "study_group_members"
        
        id = Column(Integer, primary_key=True, index=True)
        group_id = Column(Integer, ForeignKey("study_groups.id"))
        user_id = Column(Integer, ForeignKey("users.id"))
        
        # Membership details
        role = Column(String(50), default="member")  # member, moderator, admin
        status = Column(String(50), default="active")  # active, pending, suspended
        
        # Contribution tracking
        contribution_score = Column(Integer, default=0)
        study_time_contributed = Column(Integer, default=0)
        
        joined_at = Column(DateTime(timezone=True), default=datetime.utcnow)
        last_active = Column(DateTime(timezone=True), default=datetime.utcnow)
        
        # Relationships
        group = relationship("StudyGroup", back_populates="members")
        user = relationship("User")
    
    class CollaborativeSession(Base):
        """Real-time collaborative learning sessions"""
        __tablename__ = "collaborative_sessions"
        
        id = Column(Integer, primary_key=True, index=True)
        room_id = Column(Integer, ForeignKey("study_rooms.id"))
        
        # Session details
        session_type = Column(String(50))
        topic = Column(String(100))
        facilitator_id = Column(Integer, ForeignKey("users.id"))
        
        # Session state
        status = Column(String(50), default="active")  # active, paused, completed
        participant_count = Column(Integer, default=0)
        
        # Session metrics
        total_interactions = Column(Integer, default=0)
        average_engagement = Column(Float, default=0.0)
        session_score = Column(Integer, default=0)
        
        # Timing
        started_at = Column(DateTime(timezone=True), default=datetime.utcnow)
        ended_at = Column(DateTime(timezone=True))
        duration_minutes = Column(Integer, default=0)
        
        # Session data
        session_data = Column(Text)  # JSON session state and results
        
        # Relationships
        room = relationship("StudyRoom", back_populates="sessions")
        facilitator = relationship("User")
    
    class PeerInteraction(Base):
        """Peer learning interactions and help"""
        __tablename__ = "peer_interactions"
        
        id = Column(Integer, primary_key=True, index=True)
        
        # Interaction participants
        helper_id = Column(Integer, ForeignKey("users.id"))
        learner_id = Column(Integer, ForeignKey("users.id"))
        room_id = Column(Integer, ForeignKey("study_rooms.id"))
        
        # Interaction details
        interaction_type = Column(String(50))  # explanation, hint, correction, encouragement
        topic = Column(String(100))
        content = Column(Text)
        
        # Quality metrics
        helpfulness_rating = Column(Integer)  # 1-5 rating from learner
        interaction_quality = Column(Float, default=0.0)
        
        # Timing
        created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
        resolved_at = Column(DateTime(timezone=True))
        
        # Relationships
        helper = relationship("User", foreign_keys=[helper_id])
        learner = relationship("User", foreign_keys=[learner_id])
        room = relationship("StudyRoom")


class CollaborationEngine:
    """
    Core collaboration engine for peer learning
    """
    
    def __init__(self, db_session):
        """
        Initialize collaboration engine
        
        Args:
            db_session: Database session for persistence
        """
        self.db = db_session
        self.logger = logging.getLogger(__name__)
        
        # Active sessions tracking
        self.active_sessions: Dict[str, StudySession] = {}
        
        # WebSocket connections (would be managed by FastAPI)
        self.room_connections: Dict[int, Set[int]] = {}  # room_id -> user_ids
        
        # Real-time state
        self.real_time_enabled = WEBSOCKETS_AVAILABLE
    
    def create_study_room(self, creator_id: int, room_config: Dict) -> int:
        """
        Create a new study room
        
        Args:
            creator_id: User creating the room
            room_config: Room configuration
            
        Returns:
            Room ID of created room
        """
        room = CollaborationModels.StudyRoom(
            name=room_config.get("name", "Study Room"),
            description=room_config.get("description", ""),
            room_type=room_config.get("room_type", RoomType.OPEN_STUDY.value),
            topic=room_config.get("topic", "General"),
            is_public=room_config.get("is_public", True),
            max_participants=room_config.get("max_participants", 10),
            creator_id=creator_id,
            settings=json.dumps(room_config.get("settings", {}))
        )
        
        self.db.add(room)
        self.db.commit()
        
        # Add creator as first participant
        self.join_room(room.id, creator_id, role="moderator")
        
        self.logger.info(f"Created study room {room.id} by user {creator_id}")
        return room.id
    
    def join_room(self, room_id: int, user_id: int, 
                  password: str = None, role: str = "participant") -> bool:
        """
        Join a study room
        
        Args:
            room_id: Room to join
            user_id: User joining
            password: Password for private rooms
            role: User role in room
            
        Returns:
            True if successfully joined
        """
        room = self.db.query(CollaborationModels.StudyRoom)\
                     .filter(CollaborationModels.StudyRoom.id == room_id)\
                     .first()
        
        if not room or not room.is_active:
            return False
        
        # Check room capacity
        if room.current_participants >= room.max_participants:
            return False
        
        # Check if already in room
        existing = self.db.query(CollaborationModels.room_participants)\
                         .filter_by(room_id=room_id, user_id=user_id)\
                         .first()
        
        if existing:
            return True  # Already in room
        
        # Add to room
        from sqlalchemy import insert
        stmt = insert(CollaborationModels.room_participants).values(
            room_id=room_id,
            user_id=user_id,
            role=role
        )
        self.db.execute(stmt)
        
        # Update room participant count
        room.current_participants += 1
        room.last_activity = datetime.now(timezone.utc)
        
        self.db.commit()
        
        # Add to real-time tracking
        if room_id not in self.room_connections:
            self.room_connections[room_id] = set()
        self.room_connections[room_id].add(user_id)
        
        # Send join notification
        self._broadcast_to_room(room_id, {
            "type": "user_joined",
            "user_id": user_id,
            "role": role,
            "timestamp": datetime.now(timezone.utc).isoformat()
        })
        
        self.logger.info(f"User {user_id} joined room {room_id}")
        return True
    
    def leave_room(self, room_id: int, user_id: int) -> bool:
        """Leave a study room"""
        # Remove from database
        from sqlalchemy import delete
        stmt = delete(CollaborationModels.room_participants)\
              .where(CollaborationModels.room_participants.c.room_id == room_id)\
              .where(CollaborationModels.room_participants.c.user_id == user_id)
        
        result = self.db.execute(stmt)
        
        if result.rowcount > 0:
            # Update room participant count
            room = self.db.query(CollaborationModels.StudyRoom)\
                         .filter(CollaborationModels.StudyRoom.id == room_id)\
                         .first()
            
            if room:
                room.current_participants = max(0, room.current_participants - 1)
                room.last_activity = datetime.now(timezone.utc)
            
            self.db.commit()
            
            # Remove from real-time tracking
            if room_id in self.room_connections:
                self.room_connections[room_id].discard(user_id)
            
            # Send leave notification
            self._broadcast_to_room(room_id, {
                "type": "user_left",
                "user_id": user_id,
                "timestamp": datetime.now(timezone.utc).isoformat()
            })
            
            return True
        
        return False
    
    def send_message(self, room_id: int, user_id: int, 
                    message_content: str, message_type: str = "chat") -> int:
        """
        Send a message to a study room
        
        Args:
            room_id: Target room
            user_id: Message sender
            message_content: Message text
            message_type: Type of message
            
        Returns:
            Message ID
        """
        message = CollaborationModels.RoomMessage(
            room_id=room_id,
            user_id=user_id,
            message_type=message_type,
            content=message_content
        )
        
        self.db.add(message)
        self.db.commit()
        
        # Broadcast to room participants
        self._broadcast_to_room(room_id, {
            "type": "new_message",
            "message_id": message.id,
            "user_id": user_id,
            "content": message_content,
            "message_type": message_type,
            "timestamp": message.created_at.isoformat()
        })
        
        return message.id
    
    def create_peer_challenge(self, challenger_id: int, challenged_id: int,
                             challenge_config: Dict) -> int:
        """
        Create a peer challenge
        
        Args:
            challenger_id: User initiating challenge
            challenged_id: User being challenged
            challenge_config: Challenge parameters
            
        Returns:
            Challenge ID
        """
        challenge = CollaborationModels.PeerChallenge(
            challenger_id=challenger_id,
            challenged_id=challenged_id,
            challenge_type=challenge_config.get("type", ChallengeType.SPEED_CHALLENGE.value),
            name=challenge_config.get("name", "Peer Challenge"),
            description=challenge_config.get("description", ""),
            topic=challenge_config.get("topic", "General"),
            difficulty_level=challenge_config.get("difficulty", "intermediate"),
            time_limit_minutes=challenge_config.get("time_limit", 15),
            target_score=challenge_config.get("target_score", 100)
        )
        
        self.db.add(challenge)
        self.db.commit()
        
        # Notify challenged user
        self._notify_user(challenged_id, {
            "type": "challenge_received",
            "challenge_id": challenge.id,
            "challenger_id": challenger_id,
            "challenge_type": challenge.challenge_type,
            "topic": challenge.topic
        })
        
        self.logger.info(f"Challenge {challenge.id} created: {challenger_id} vs {challenged_id}")
        return challenge.id
    
    def accept_challenge(self, challenge_id: int, user_id: int) -> bool:
        """Accept a peer challenge"""
        challenge = self.db.query(CollaborationModels.PeerChallenge)\
                          .filter(CollaborationModels.PeerChallenge.id == challenge_id)\
                          .first()
        
        if not challenge or challenge.challenged_id != user_id or challenge.status != "pending":
            return False
        
        challenge.status = "active"
        challenge.started_at = datetime.now(timezone.utc)
        self.db.commit()
        
        # Create challenge room
        room_config = {
            "name": f"Challenge: {challenge.name}",
            "room_type": RoomType.CHALLENGE_ROOM.value,
            "topic": challenge.topic,
            "is_public": False,
            "max_participants": 2
        }
        
        room_id = self.create_study_room(challenge.challenger_id, room_config)
        challenge.room_id = room_id
        
        # Add both participants
        self.join_room(room_id, challenge.challenged_id)
        
        self.db.commit()
        
        # Notify both users
        self._notify_user(challenge.challenger_id, {
            "type": "challenge_accepted",
            "challenge_id": challenge_id,
            "room_id": room_id
        })
        
        return True
    
    def update_challenge_progress(self, challenge_id: int, user_id: int, 
                                 score: int, progress_data: Dict) -> Dict:
        """Update challenge progress and check for completion"""
        challenge = self.db.query(CollaborationModels.PeerChallenge)\
                          .filter(CollaborationModels.PeerChallenge.id == challenge_id)\
                          .first()
        
        if not challenge or challenge.status != "active":
            return {"error": "Challenge not found or not active"}
        
        # Update appropriate score
        if user_id == challenge.challenger_id:
            challenge.challenger_score = score
        elif user_id == challenge.challenged_id:
            challenge.challenged_score = score
        else:
            return {"error": "User not part of this challenge"}
        
        # Update challenge data
        current_data = json.loads(challenge.challenge_data or "{}")
        current_data[f"user_{user_id}_progress"] = progress_data
        challenge.challenge_data = json.dumps(current_data)
        
        # Check for completion
        result = {"challenge_complete": False}
        
        if self._is_challenge_complete(challenge):
            challenge.status = "completed"
            challenge.completed_at = datetime.now(timezone.utc)
            
            # Determine winner
            if challenge.challenger_score > challenge.challenged_score:
                challenge.winner_id = challenge.challenger_id
            elif challenge.challenged_score > challenge.challenger_score:
                challenge.winner_id = challenge.challenged_id
            # else: tie, no winner
            
            result["challenge_complete"] = True
            result["winner_id"] = challenge.winner_id
            result["final_scores"] = {
                "challenger": challenge.challenger_score,
                "challenged": challenge.challenged_score
            }
            
            # Notify participants
            self._broadcast_to_room(challenge.room_id, {
                "type": "challenge_completed",
                "challenge_id": challenge_id,
                "winner_id": challenge.winner_id,
                "scores": result["final_scores"]
            })
        
        self.db.commit()
        return result
    
    def get_room_participants(self, room_id: int) -> List[Dict]:
        """Get list of room participants"""
        from sqlalchemy import select
        stmt = select(CollaborationModels.room_participants)\
              .where(CollaborationModels.room_participants.c.room_id == room_id)
        
        participants = []
        for row in self.db.execute(stmt):
            participants.append({
                "user_id": row.user_id,
                "role": row.role,
                "joined_at": row.joined_at.isoformat()
            })
        
        return participants
    
    def get_study_rooms(self, user_id: int = None, 
                       topic: str = None, limit: int = 20) -> List[Dict]:
        """Get available study rooms"""
        query = self.db.query(CollaborationModels.StudyRoom)\
                      .filter(CollaborationModels.StudyRoom.is_active == True)
        
        if topic:
            query = query.filter(CollaborationModels.StudyRoom.topic.ilike(f"%{topic}%"))
        
        if user_id:
            # Could filter for rooms user has access to
            pass
        
        rooms = []
        for room in query.limit(limit).all():
            rooms.append({
                "id": room.id,
                "name": room.name,
                "description": room.description,
                "room_type": room.room_type,
                "topic": room.topic,
                "current_participants": room.current_participants,
                "max_participants": room.max_participants,
                "is_public": room.is_public,
                "created_at": room.created_at.isoformat(),
                "last_activity": room.last_activity.isoformat()
            })
        
        return rooms
    
    def _broadcast_to_room(self, room_id: int, message: Dict):
        """Broadcast message to all room participants"""
        # In production, this would use WebSocket connections
        # For now, we'll just log the message
        self.logger.info(f"Broadcasting to room {room_id}: {message}")
        
        # Store as system message for message history
        if message.get("type") not in ["user_joined", "user_left"]:
            system_message = CollaborationModels.RoomMessage(
                room_id=room_id,
                user_id=None,  # System message
                message_type=MessageType.SYSTEM.value,
                content=json.dumps(message)
            )
            self.db.add(system_message)
            self.db.commit()
    
    def _notify_user(self, user_id: int, notification: Dict):
        """Send notification to specific user"""
        # In production, this would use push notifications or WebSockets
        self.logger.info(f"Notifying user {user_id}: {notification}")
    
    def _is_challenge_complete(self, challenge) -> bool:
        """Check if challenge completion conditions are met"""
        # Time limit reached
        if challenge.time_limit_minutes:
            time_elapsed = (datetime.now(timezone.utc) - challenge.started_at).total_seconds() / 60
            if time_elapsed >= challenge.time_limit_minutes:
                return True
        
        # Target score reached
        if challenge.target_score:
            if (challenge.challenger_score >= challenge.target_score or 
                challenge.challenged_score >= challenge.target_score):
                return True
        
        return False
    
    def get_user_collaboration_stats(self, user_id: int) -> Dict:
        """Get user's collaboration statistics"""
        # Challenges participated in
        challenges = self.db.query(CollaborationModels.PeerChallenge)\
                           .filter(
                               (CollaborationModels.PeerChallenge.challenger_id == user_id) |
                               (CollaborationModels.PeerChallenge.challenged_id == user_id)
                           ).all()
        
        # Peer interactions
        interactions = self.db.query(CollaborationModels.PeerInteraction)\
                             .filter(
                                 (CollaborationModels.PeerInteraction.helper_id == user_id) |
                                 (CollaborationModels.PeerInteraction.learner_id == user_id)
                             ).all()
        
        # Study group memberships
        group_memberships = self.db.query(CollaborationModels.StudyGroupMember)\
                                  .filter(CollaborationModels.StudyGroupMember.user_id == user_id)\
                                  .all()
        
        return {
            "challenges_participated": len(challenges),
            "challenges_won": len([c for c in challenges if c.winner_id == user_id]),
            "peer_interactions": len(interactions),
            "help_provided": len([i for i in interactions if i.helper_id == user_id]),
            "help_received": len([i for i in interactions if i.learner_id == user_id]),
            "study_groups": len(group_memberships),
            "total_collaboration_time": sum(m.study_time_contributed for m in group_memberships)
        }

from fastapi import FastAPI, HTTPException, Path, Depends
from pydantic import BaseModel
from typing import List
from datetime import datetime
from sqlalchemy import create_engine, Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session

app = FastAPI()

# Database setup
DATABASE_URL = "sqlite:///./sns.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Database models
class PostDB(Base):
    __tablename__ = "posts"
    id = Column(Integer, primary_key=True, index=True)
    userName = Column(String, nullable=False)
    content = Column(String, nullable=False)
    createdAt = Column(DateTime, default=datetime.utcnow)
    updatedAt = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    likeCount = Column(Integer, default=0)
    commentCount = Column(Integer, default=0)

class CommentDB(Base):
    __tablename__ = "comments"
    id = Column(Integer, primary_key=True, index=True)
    postId = Column(Integer, ForeignKey("posts.id"), nullable=False)
    userName = Column(String, nullable=False)
    content = Column(String, nullable=False)
    createdAt = Column(DateTime, default=datetime.utcnow)
    updatedAt = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class LikeDB(Base):
    __tablename__ = "likes"
    id = Column(Integer, primary_key=True, index=True)
    postId = Column(Integer, ForeignKey("posts.id"), nullable=False)
    userName = Column(String, nullable=False)

# Create tables
Base.metadata.create_all(bind=engine)

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Pydantic models
class Post(BaseModel):
    id: int
    userName: str
    content: str
    createdAt: datetime
    updatedAt: datetime
    likeCount: int
    commentCount: int

    class Config:
        orm_mode = True

class CreatePostRequest(BaseModel):
    userName: str
    content: str

class UpdatePostRequest(BaseModel):
    content: str

class Comment(BaseModel):
    id: int
    postId: int
    userName: str
    content: str
    createdAt: datetime
    updatedAt: datetime

    class Config:
        orm_mode = True

class CreateCommentRequest(BaseModel):
    userName: str
    content: str

class UpdateCommentRequest(BaseModel):
    content: str

class LikeRequest(BaseModel):
    userName: str

# Endpoints
@app.get("/api/posts", response_model=List[Post])
def get_posts(db: Session = Depends(get_db)):
    return db.query(PostDB).all()

@app.post("/api/posts", response_model=Post, status_code=201)
def create_post(request: CreatePostRequest, db: Session = Depends(get_db)):
    new_post = PostDB(
        userName=request.userName,
        content=request.content
    )
    db.add(new_post)
    db.commit()
    db.refresh(new_post)
    return new_post

@app.get("/api/posts/{postId}", response_model=Post)
def get_post(postId: int, db: Session = Depends(get_db)):
    post = db.query(PostDB).filter(PostDB.id == postId).first()
    if not post:
        raise HTTPException(status_code=404, detail="포스트를 찾을 수 없음")
    return post

@app.patch("/api/posts/{postId}", response_model=Post)
def update_post(request: UpdatePostRequest, postId: int, db: Session = Depends(get_db)):
    post = db.query(PostDB).filter(PostDB.id == postId).first()
    if not post:
        raise HTTPException(status_code=404, detail="포스트를 찾을 수 없음")
    post.content = request.content
    db.commit()
    db.refresh(post)
    return post

@app.delete("/api/posts/{postId}", status_code=204)
def delete_post(postId: int, db: Session = Depends(get_db)):
    post = db.query(PostDB).filter(PostDB.id == postId).first()
    if not post:
        raise HTTPException(status_code=404, detail="포스트를 찾을 수 없음")
    db.delete(post)
    db.commit()

@app.get("/api/posts/{postId}/comments", response_model=List[Comment])
def get_comments(postId: int, db: Session = Depends(get_db)):
    return db.query(CommentDB).filter(CommentDB.postId == postId).all()

@app.post("/api/posts/{postId}/comments", response_model=Comment, status_code=201)
def create_comment(request: CreateCommentRequest, postId: int, db: Session = Depends(get_db)):
    post = db.query(PostDB).filter(PostDB.id == postId).first()
    if not post:
        raise HTTPException(status_code=404, detail="포스트를 찾을 수 없음")
    new_comment = CommentDB(
        postId=postId,
        userName=request.userName,
        content=request.content
    )
    db.add(new_comment)
    post.commentCount += 1
    db.commit()
    db.refresh(new_comment)
    return new_comment

@app.get("/api/posts/{postId}/comments/{commentId}", response_model=Comment)
def get_comment(postId: int, commentId: int, db: Session = Depends(get_db)):
    comment = db.query(CommentDB).filter(CommentDB.postId == postId, CommentDB.id == commentId).first()
    if not comment:
        raise HTTPException(status_code=404, detail="댓글 또는 포스트를 찾을 수 없음")
    return comment

@app.patch("/api/posts/{postId}/comments/{commentId}", response_model=Comment)
def update_comment(request: UpdateCommentRequest, postId: int, commentId: int, db: Session = Depends(get_db)):
    comment = db.query(CommentDB).filter(CommentDB.postId == postId, CommentDB.id == commentId).first()
    if not comment:
        raise HTTPException(status_code=404, detail="댓글 또는 포스트를 찾을 수 없음")
    comment.content = request.content
    db.commit()
    db.refresh(comment)
    return comment

@app.delete("/api/posts/{postId}/comments/{commentId}", status_code=204)
def delete_comment(postId: int, commentId: int, db: Session = Depends(get_db)):
    comment = db.query(CommentDB).filter(CommentDB.postId == postId, CommentDB.id == commentId).first()
    if not comment:
        raise HTTPException(status_code=404, detail="댓글 또는 포스트를 찾을 수 없음")
    db.delete(comment)
    post = db.query(PostDB).filter(PostDB.id == postId).first()
    if post:
        post.commentCount -= 1
    db.commit()

@app.post("/api/posts/{postId}/likes", status_code=201)
def like_post(request: LikeRequest, postId: int, db: Session = Depends(get_db)):
    post = db.query(PostDB).filter(PostDB.id == postId).first()
    if not post:
        raise HTTPException(status_code=404, detail="포스트를 찾을 수 없음")
    new_like = LikeDB(
        postId=postId,
        userName=request.userName
    )
    db.add(new_like)
    post.likeCount += 1
    db.commit()

@app.delete("/api/posts/{postId}/likes", status_code=204)
def unlike_post(request: LikeRequest, postId: int, db: Session = Depends(get_db)):
    post = db.query(PostDB).filter(PostDB.id == postId).first()
    if not post:
        raise HTTPException(status_code=404, detail="포스트를 찾을 수 없음")
    like = db.query(LikeDB).filter(LikeDB.postId == postId, LikeDB.userName == request.userName).first()
    if like:
        db.delete(like)
        post.likeCount -= 1
    db.commit()
from sqlalchemy.orm import Session
from models import Role, User
from database import SessionLocal, engine
import auth

def create_roles_and_users():
    db: Session = SessionLocal()
    
    # Crear roles
    admin_role = Role(name="admin", description="Administrator")
    user_role = Role(name="user", description="Regular user")

    db.add(admin_role)
    db.add(user_role)
    db.commit()
    db.refresh(admin_role)
    db.refresh(user_role)

    # Crear usuarios
    admin_user = User(
        username="guillem",
        email="guillem@example.com",
        hashed_password=auth.get_password_hash("1234"),
        role_id=admin_role.id
    )

    regular_user = User(
        username="maria",
        email="maria@example.com",
        hashed_password=auth.get_password_hash("1234"),
        role_id=user_role.id
    )

    db.add(admin_user)
    db.add(regular_user)
    db.commit()
    db.close()

if __name__ == "__main__":
    from models import Base
    Base.metadata.create_all(bind=engine)
    create_roles_and_users()

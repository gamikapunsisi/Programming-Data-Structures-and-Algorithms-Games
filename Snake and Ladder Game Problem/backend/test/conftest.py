import os
import tempfile
import pytest
from app import app, init_db, DB_NAME

@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    # Create temporary DB file
    temp_db = tempfile.NamedTemporaryFile(delete=False)
    test_db_path = temp_db.name
    temp_db.close()

    # Replace DB_NAME with temporary DB
    app.config['TESTING'] = True
    global DB_NAME
    DB_NAME = test_db_path

    # Initialize DB structure
    init_db()

    yield

    # Delete temporary DB after tests
    os.unlink(test_db_path)


@pytest.fixture
def client():
    with app.test_client() as client:
        yield client

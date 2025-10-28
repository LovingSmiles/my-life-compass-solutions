# test_algorithm.py
from my_life_compass_solutions_healing_algorithm import LifeCompassProAlgorithm, UserProfile
import datetime, json

# Create a test user
user = UserProfile(id="user001", created_at=datetime.datetime.utcnow())

# Initialize the algorithm
algo = LifeCompassProAlgorithm(user)

# Add some moods and journaling entries
algo.add_mood(-2)
algo.add_mood(2)
algo.add_entry("I felt anxious earlier, but I realized I was just overwhelmed.")
algo.add_entry("Feeling calmer and proud that I handled things better today.")

# Run the algorithm
growth = algo.compute_growth()
recommendation = algo.next_recommendation()

# Print the output
print("Growth Metrics:", growth)
print("Next Recommendation:", json.dumps(recommendation, indent=2))
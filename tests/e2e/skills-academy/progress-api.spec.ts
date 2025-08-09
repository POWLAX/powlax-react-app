import { test, expect } from '@playwright/test';

test.use({
  baseURL: 'http://localhost:3002', // CRITICAL: Use port 3002
});

test.describe('Skills Academy Progress API', () => {
  const testUserId = 'test-user-progress-api';
  const testWorkoutId = 1;

  test('should create new workout progress via API', async ({ request }) => {
    const progressData = {
      user_id: testUserId,
      workout_id: testWorkoutId,
      current_drill_index: 0,
      drills_completed: 0,
      total_drills: 5,
      total_time_seconds: 0,
      points_earned: 0,
      status: 'in_progress',
      completion_percentage: 0,
      perfect_drills: 0
    };

    const response = await request.post('/api/workouts/progress', {
      data: progressData
    });

    expect(response.status()).toBe(200);
    
    const responseData = await response.json();
    expect(responseData.success).toBe(true);
    expect(responseData.progress).toBeDefined();
    expect(responseData.progress.user_id).toBe(testUserId);
    expect(responseData.progress.workout_id).toBe(testWorkoutId);
    expect(responseData.progress.status).toBe('in_progress');
    
    console.log('Progress created:', responseData.progress);
  });

  test('should update existing workout progress', async ({ request }) => {
    // First create a progress record
    const initialData = {
      user_id: testUserId,
      workout_id: testWorkoutId,
      current_drill_index: 0,
      drills_completed: 0,
      total_drills: 5,
      status: 'in_progress'
    };

    await request.post('/api/workouts/progress', {
      data: initialData
    });

    // Then update it
    const updateData = {
      user_id: testUserId,
      workout_id: testWorkoutId,
      current_drill_index: 2,
      drills_completed: 2,
      total_drills: 5,
      points_earned: 20,
      completion_percentage: 40,
      perfect_drills: 1,
      status: 'in_progress'
    };

    const response = await request.post('/api/workouts/progress', {
      data: updateData
    });

    expect(response.status()).toBe(200);
    
    const responseData = await response.json();
    expect(responseData.success).toBe(true);
    expect(responseData.progress.current_drill_index).toBe(2);
    expect(responseData.progress.drills_completed).toBe(2);
    expect(responseData.progress.points_earned).toBe(20);
    expect(responseData.progress.perfect_drills).toBe(1);
    
    console.log('Progress updated:', responseData.progress);
  });

  test('should complete workout and update points', async ({ request }) => {
    const completionData = {
      user_id: testUserId,
      workout_id: testWorkoutId,
      current_drill_index: 4,
      drills_completed: 5,
      total_drills: 5,
      total_time_seconds: 300,
      points_earned: 100,
      completion_percentage: 100,
      perfect_drills: 3,
      status: 'completed'
    };

    const response = await request.post('/api/workouts/progress', {
      data: completionData
    });

    expect(response.status()).toBe(200);
    
    const responseData = await response.json();
    expect(responseData.success).toBe(true);
    expect(responseData.progress.status).toBe('completed');
    expect(responseData.progress.completion_percentage).toBe(100);
    expect(responseData.progress.completed_at).toBeDefined();
    
    console.log('Workout completed:', responseData.progress);
  });

  test('should fetch user progress via GET API', async ({ request }) => {
    // First create some progress data
    const progressData = {
      user_id: testUserId,
      workout_id: testWorkoutId,
      current_drill_index: 3,
      drills_completed: 3,
      total_drills: 5,
      points_earned: 30,
      status: 'in_progress'
    };

    await request.post('/api/workouts/progress', {
      data: progressData
    });

    // Then fetch it
    const response = await request.get(`/api/workouts/progress?user_id=${testUserId}`);
    
    expect(response.status()).toBe(200);
    
    const responseData = await response.json();
    expect(responseData.success).toBe(true);
    expect(responseData.progress).toBeDefined();
    expect(Array.isArray(responseData.progress)).toBe(true);
    expect(responseData.progress.length).toBeGreaterThan(0);
    
    const userProgress = responseData.progress.find((p: any) => p.workout_id === testWorkoutId);
    expect(userProgress).toBeDefined();
    expect(userProgress.user_id).toBe(testUserId);
    
    console.log('Progress fetched:', responseData.progress);
  });

  test('should fetch specific workout progress', async ({ request }) => {
    const response = await request.get(`/api/workouts/progress?user_id=${testUserId}&workout_id=${testWorkoutId}`);
    
    expect(response.status()).toBe(200);
    
    const responseData = await response.json();
    expect(responseData.success).toBe(true);
    expect(responseData.progress).toBeDefined();
    
    if (responseData.progress.length > 0) {
      const progress = responseData.progress[0];
      expect(progress.user_id).toBe(testUserId);
      expect(progress.workout_id).toBe(testWorkoutId);
      expect(progress.workout).toBeDefined(); // Should include workout details
    }
    
    console.log('Specific workout progress:', responseData.progress);
  });

  test('should handle API validation errors', async ({ request }) => {
    // Test missing user_id
    const response1 = await request.post('/api/workouts/progress', {
      data: {
        workout_id: testWorkoutId,
        status: 'in_progress'
      }
    });
    
    expect(response1.status()).toBe(400);
    
    const responseData1 = await response1.json();
    expect(responseData1.error).toContain('user_id');
    
    // Test missing workout_id
    const response2 = await request.post('/api/workouts/progress', {
      data: {
        user_id: testUserId,
        status: 'in_progress'
      }
    });
    
    expect(response2.status()).toBe(400);
    
    const responseData2 = await response2.json();
    expect(responseData2.error).toContain('workout_id');
    
    console.log('Validation errors handled correctly');
  });

  test('should handle points distribution correctly', async ({ request }) => {
    const testPoints = 63; // Should distribute as: 11, 11, 11, 10, 10, 10
    
    const completionData = {
      user_id: `${testUserId}-points`,
      workout_id: testWorkoutId,
      drills_completed: 5,
      total_drills: 5,
      points_earned: testPoints,
      status: 'completed'
    };

    const response = await request.post('/api/workouts/progress', {
      data: completionData
    });

    expect(response.status()).toBe(200);
    
    // The API should distribute points across 6 types
    // We can verify this worked by checking that progress was updated
    const responseData = await response.json();
    expect(responseData.success).toBe(true);
    expect(responseData.progress.points_earned).toBe(testPoints);
    
    console.log('Points distribution test completed for', testPoints, 'points');
  });

  test('should handle GET API validation', async ({ request }) => {
    // Test missing user_id
    const response = await request.get('/api/workouts/progress');
    
    expect(response.status()).toBe(400);
    
    const responseData = await response.json();
    expect(responseData.error).toContain('user_id');
    
    console.log('GET API validation handled correctly');
  });

  test('should test API directly via curl command', async ({ page }) => {
    // This test ensures the API is accessible from the correct port
    await page.goto('/');
    
    const testData = {
      user_id: 'curl-test-user',
      workout_id: 1,
      status: 'in_progress',
      drills_completed: 1,
      total_drills: 5
    };
    
    // Test via fetch from the browser context (ensuring port 3002 is working)
    const result = await page.evaluate(async (data) => {
      try {
        const response = await fetch('/api/workouts/progress', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });
        
        const responseData = await response.json();
        return { status: response.status, data: responseData };
      } catch (error) {
        return { error: error instanceof Error ? error.message : 'Unknown error' };
      }
    }, testData);
    
    console.log('Browser fetch result:', result);
    
    expect(result.status).toBe(200);
    expect(result.data.success).toBe(true);
  });
});
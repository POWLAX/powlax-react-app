-- Update point type images from WordPress CSV export
-- Points-Types-Export-2025-July-31-1904.csv

UPDATE powlax_points_currencies 
SET icon_url = 'https://powlax.com/wp-content/uploads/2024/10/Lax-Credits.png'
WHERE name = 'lax_credit' OR slug = 'lax-credit';

UPDATE powlax_points_currencies 
SET icon_url = 'https://powlax.com/wp-content/uploads/2024/10/Attack-Tokens-1.png'
WHERE name = 'attack_token' OR slug = 'attack-token';

UPDATE powlax_points_currencies 
SET icon_url = 'https://powlax.com/wp-content/uploads/2024/10/Defense-Dollars-1.png'
WHERE name = 'defense_dollar' OR slug = 'defense-dollar';

UPDATE powlax_points_currencies 
SET icon_url = 'https://powlax.com/wp-content/uploads/2024/10/Midfield-Medals-1.png'
WHERE name = 'midfield_medal' OR slug = 'midfield-medal';

UPDATE powlax_points_currencies 
SET icon_url = 'https://powlax.com/wp-content/uploads/2024/10/Rebound-Rewards-1.png'
WHERE name = 'rebound_reward' OR slug = 'rebound-reward';

UPDATE powlax_points_currencies 
SET icon_url = 'https://powlax.com/wp-content/uploads/2025/01/Lax-IQ-Points.png'
WHERE name = 'lax_iq_point' OR slug = 'lax-iq-point';

UPDATE powlax_points_currencies 
SET icon_url = 'https://powlax.com/wp-content/uploads/2025/02/SS-Flex-Points-1.png'
WHERE name = 'flex_point' OR slug = 'flex-point';

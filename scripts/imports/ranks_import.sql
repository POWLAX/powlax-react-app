-- POWLAX Player Ranks Import
-- Generated: 2025-08-04T23:06:15.318667
-- Total Ranks: 10


-- Player Ranks Table
CREATE TABLE IF NOT EXISTS player_ranks (
    id SERIAL PRIMARY KEY,
    original_id INTEGER UNIQUE,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE,
    description TEXT,
    excerpt TEXT,
    rank_order INTEGER NOT NULL,
    image_url TEXT,
    next_rank_id INTEGER,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Rank Requirements Table
CREATE TABLE IF NOT EXISTS rank_requirements (
    id SERIAL PRIMARY KEY,
    rank_id INTEGER REFERENCES player_ranks(id),
    requirement_type VARCHAR(50),
    requirement_config JSONB,
    sequence_order INTEGER,
    is_optional BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- User Rank Progress Table
CREATE TABLE IF NOT EXISTS user_rank_progress (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users,
    current_rank_id INTEGER REFERENCES player_ranks(id),
    points_progress JSONB DEFAULT '{}'::jsonb,
    rank_achieved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Indexes
CREATE INDEX idx_rank_order ON player_ranks(rank_order);
CREATE INDEX idx_user_rank ON user_rank_progress(user_id, current_rank_id);


INSERT INTO player_ranks (
    original_id,
    title,
    slug,
    description,
    excerpt,
    rank_order,
    image_url,
    metadata,
    created_at
) VALUES (
    25710,
    'DALL·E 2024-10-03 12.27.11 - A cartoonish 3D animated lacrosse player with a robotic appearance, showcasing a confused expression. The character is depicted mechanically moving th',
    'lax-bot',
    'Everyone starts out as a "Lacrosse Bot" lacks game awareness and skill, often making basic mistakes and following others without understanding why. They move through drills and plays mechanically, focusing more on mimicking the motions than truly grasping the strategy or technique behind them. If you keep working, you won''t be a bot long...',
    'The "Lacrosse Bot" lacks game awareness and skill, often making basic mistakes and following others without understanding why. They move through drills and plays mechanically, showing more focus on mimicking the motions than truly grasping the strategy or technique behind them. If you keep working, you won''t be a bot long...',
    1,
    NULL,
    '{"points_to_unlock": "0", "maximum_earners": "0", "layout": "top", "align": "center", "congratulations_text": "<p>Welcome to the game, Lacrosse Bot! You\u2019re starting to get the hang of it. Keep training, and soon you'll be more than just a programmed player!\"</p>", "notifications_by_type_title_size": "h2", "notifications_by_type_heading_size": "h4", "notifications_by_type_earners_limit": "0", "notifications_by_type_layout": "left", "notifications_by_type_align": "none"}'::jsonb,
    NOW()
) ON CONFLICT (original_id) DO UPDATE SET
    title = EXCLUDED.title,
    rank_order = EXCLUDED.rank_order,
    updated_at = NOW();

INSERT INTO player_ranks (
    original_id,
    title,
    slug,
    description,
    excerpt,
    rank_order,
    image_url,
    metadata,
    created_at
) VALUES (
    25790,
    'DALL·E 2024-10-03 12.27.45 - A 3D animated, cartoonish lacrosse player with oversized helmet bars that obscure his vision, like peering through a mail slot. This character is awkw',
    '2nd-bar-syndrome',
    'Ever feel like you''re just not seeing the big picture? That''s our friend with the 2nd Bar Syndrome, constantly navigating the field as if he''s peering through a mail slot. While he might occasionally bump into success, improving his field awareness is crucial. Cradling, catching, and passing are not just skills, but his stepping stones to actually knowing why he''s on the field and not just part of the scenery.',
    'Ever feel like you''re just not seeing the big picture? That''s our friend with the 2nd Bar Syndrome, constantly navigating the field as if he''s peering through a mail slot. While he might occasionally bump into success, improving his field awareness is crucial. Cradling, catching, and passing are not just skills, but his stepping stones to actually knowing why he''s on the field and not just part of the scenery.',
    2,
    NULL,
    '{"points_to_unlock": "0", "maximum_earners": "0", "layout": "top", "align": "center", "congratulations_text": "<p>You\u2019ve graduated to 2nd Bar Syndrome! Your vision might still be a bit blocked, but your understanding of the game is starting to clear up. Keep pushing, and the field will open up soon!</p>", "notifications_by_type_title_size": "h2", "notifications_by_type_heading_size": "h4", "notifications_by_type_earners_limit": "0", "notifications_by_type_layout": "left", "notifications_by_type_align": "none"}'::jsonb,
    NOW()
) ON CONFLICT (original_id) DO UPDATE SET
    title = EXCLUDED.title,
    rank_order = EXCLUDED.rank_order,
    updated_at = NOW();

INSERT INTO player_ranks (
    original_id,
    title,
    slug,
    description,
    excerpt,
    rank_order,
    image_url,
    metadata,
    created_at
) VALUES (
    25794,
    'DALL·E 2024-10-03 12.30.12 - A high-resolution 3D animated image of a cheerful lacrosse player sitting on the sideline, fully equipped, intensely observing the game. The player, d',
    'left-bench',
    'He made the team, but that''s just the start. Our Left Bench hero might not play much, but he''s got the best seat in the house to learn. Every game is a chance to soak up strategies and prep for the moment he steps off that bench. Remember, every great play starts with a great observer.',
    'He made the team, but that''s just the start. Our Left Bench hero might not play much, but he''s got the best seat in the house to learn. Every game is a chance to soak up strategies and prep for the moment he steps off that bench. Remember, every great play starts with a great observer.',
    3,
    NULL,
    '{"points_to_unlock": "0", "maximum_earners": "0", "layout": "top", "align": "center", "congratulations_text": "<p>Welcome to the team bench! While you might not be in the starting lineup yet, every game is an opportunity to learn and grow. Watch, learn, and prepare\u2014your time to shine will come!</p>", "notifications_by_type_title_size": "h2", "notifications_by_type_heading_size": "h4", "notifications_by_type_earners_limit": "0", "notifications_by_type_layout": "left", "notifications_by_type_align": "none", "notifications_by_type_disable_ranks": "on"}'::jsonb,
    NOW()
) ON CONFLICT (original_id) DO UPDATE SET
    title = EXCLUDED.title,
    rank_order = EXCLUDED.rank_order,
    updated_at = NOW();

INSERT INTO player_ranks (
    original_id,
    title,
    slug,
    description,
    excerpt,
    rank_order,
    image_url,
    metadata,
    created_at
) VALUES (
    25803,
    'DALL·E 2024-10-03 12.30.10 - Animated scene of a lacrosse player on the bench, leading celebrations with dynamic, exaggerated motions like dances and fist pumps. The character is',
    'celly-king',
    'The hype-man of the bench. He might not score the goals, but he leads the league in celebrations. From gritty dances to flashy fist pumps, he''s got a celebration for every play. His spirit lifts the team, proving you don''t need to be on the field to make a play.',
    'The hype-man of the bench. He might not score the goals, but he leads the league in celebrations. From gritty dances to flashy fist pumps, he''s got a celebration for every play. His spirit lifts the team, proving you don''t need to be on the field to make a play.',
    4,
    NULL,
    '{"points_to_unlock": "0", "maximum_earners": "0", "layout": "top", "align": "center", "congratulations_text": "<p>All hail the Celly King! Your spirit is unmatched. Remember, every champion was once a contender who refused to give up</p>", "notifications_by_type_title_size": "h2", "notifications_by_type_heading_size": "h4", "notifications_by_type_earners_limit": "0", "notifications_by_type_layout": "left", "notifications_by_type_align": "none"}'::jsonb,
    NOW()
) ON CONFLICT (original_id) DO UPDATE SET
    title = EXCLUDED.title,
    rank_order = EXCLUDED.rank_order,
    updated_at = NOW();

INSERT INTO player_ranks (
    original_id,
    title,
    slug,
    description,
    excerpt,
    rank_order,
    image_url,
    metadata,
    created_at
) VALUES (
    26500,
    'DALL·E 2024-10-05 22.10.09 - A cartoonish, 3D animated image of a lacrosse defensive midfielder, known as D-Mid Rising, viewed from the front. The top of the helmet slightly cover',
    'd-mid-rising',
    'Emerging from the sidelines to the heart of the action, you''re honing your transition skills and sharpening defensive instincts. As your field presence grows, you''re starting to disrupt opponents’ plays and influence game flow.',
    'Emerging from the sidelines to the heart of the action, you''re honing your transition skills and sharpening defensive instincts. As your field presence grows, you''re starting to disrupt opponents’ plays and influence game flow.',
    5,
    NULL,
    '{"points_to_unlock": "0", "points_type_to_unlock": "lax-credit", "maximum_earners": "0", "layout": "top", "align": "center", "congratulations_text": "<p>You're on the field and making a difference! Your journey to becoming a key player in both offense and defense is well underway.</p>", "notifications_by_type_title_size": "h2", "notifications_by_type_heading_size": "h4", "notifications_by_type_earners_limit": "0", "notifications_by_type_layout": "left", "notifications_by_type_align": "none"}'::jsonb,
    NOW()
) ON CONFLICT (original_id) DO UPDATE SET
    title = EXCLUDED.title,
    rank_order = EXCLUDED.rank_order,
    updated_at = NOW();

INSERT INTO player_ranks (
    original_id,
    title,
    slug,
    description,
    excerpt,
    rank_order,
    image_url,
    metadata,
    created_at
) VALUES (
    26501,
    'Lacrosse Utility|D 3 Super Hero|Flow Bro|Lax God|Tilt Master',
    'lacrosse-utility',
    'Versatile level. Like a Swiss Army knife, your ability to adapt and fill various roles makes you invaluable.',
    'Versatile level. Like a Swiss Army knife, your ability to adapt and fill various roles makes you invaluable.',
    6,
    NULL,
    '{"points_to_unlock": "0", "maximum_earners": "0", "layout": "top", "align": "center", "congratulations_text": "<p>Indispensable\u2014that\u2019s what you are becoming to your team! Your hard work and versatility are paying off.</p>", "notifications_by_type_title_size": "h2", "notifications_by_type_heading_size": "h4", "notifications_by_type_earners_limit": "0", "notifications_by_type_layout": "left", "notifications_by_type_align": "none"}'::jsonb,
    NOW()
) ON CONFLICT (original_id) DO UPDATE SET
    title = EXCLUDED.title,
    rank_order = EXCLUDED.rank_order,
    updated_at = NOW();

INSERT INTO player_ranks (
    original_id,
    title,
    slug,
    description,
    excerpt,
    rank_order,
    image_url,
    metadata,
    created_at
) VALUES (
    26502,
    'Flow Bro',
    'flow-bro',
    'Stylist level. Not only do you play with flair, but your iconic style sets you apart on and off the field.',
    'Stylist level. Not only do you play with flair, but your iconic style sets you apart on and off the field.',
    7,
    NULL,
    '{"points_to_unlock": "0", "maximum_earners": "0", "layout": "top", "align": "center", "congratulations_text": "<p>Effortlessly cool, both in play and presence! Keep dazzling on the field and dropping those jaws.</p>", "notifications_by_type_title_size": "h2", "notifications_by_type_heading_size": "h4", "notifications_by_type_earners_limit": "0", "notifications_by_type_layout": "left", "notifications_by_type_align": "none"}'::jsonb,
    NOW()
) ON CONFLICT (original_id) DO UPDATE SET
    title = EXCLUDED.title,
    rank_order = EXCLUDED.rank_order,
    updated_at = NOW();

INSERT INTO player_ranks (
    original_id,
    title,
    slug,
    description,
    excerpt,
    rank_order,
    image_url,
    metadata,
    created_at
) VALUES (
    28520,
    'Lax Beast|Lax God 2|Stick Sorcerer',
    'lax-beast',
    'The Lax Beast is a fearsome competitor on the lacrosse field, combining raw intensity with unmatched skill. His presence is enough to make any opponent think twice, and his aggressive playstyle leaves a lasting impact. He''s a force of nature that dominates every aspect of the game, making him one of the most feared players on the field.',
    'The Lax Beast is a fearsome competitor on the lacrosse field, combining raw intensity with unmatched skill. His presence is enough to make any opponent think twice, and his aggressive playstyle leaves a lasting impact. He''s a force of nature that dominates every aspect of the game, making him one of the most feared players on the field.',
    8,
    NULL,
    '{"points_to_unlock": "900", "points_type_to_unlock": "lax-credit", "maximum_earners": "0", "layout": "top", "align": "center", "congratulations_text": "<p><span style=\"color: #000000;font-family: Times;font-size: medium\">Congrats, Lax Beast! You've unleashed your intensity and skill, and now the field is your hunting ground! Keep playing with ferocity, and remember\u2014no one can stand in your way!</span></p>", "notifications_by_type_title_size": "h2", "notifications_by_type_heading_size": "h4", "notifications_by_type_earners_limit": "0", "notifications_by_type_layout": "left", "notifications_by_type_align": "none"}'::jsonb,
    NOW()
) ON CONFLICT (original_id) DO UPDATE SET
    title = EXCLUDED.title,
    rank_order = EXCLUDED.rank_order,
    updated_at = NOW();

INSERT INTO player_ranks (
    original_id,
    title,
    slug,
    description,
    excerpt,
    rank_order,
    image_url,
    metadata,
    created_at
) VALUES (
    28525,
    'Lax Ninja',
    'stick-sorcerer',
    'The Lax Ninja moves with stealth and precision, blending agility, focus, and technique. With seamless transitions and flawless stick skills, they dominate the field, outsmarting opponents while staying elusive. The lacrosse field is their dojo, where they strike when the moment demands.',
    'The Lax Ninja moves with stealth and precision, blending agility, focus, and technique. With seamless transitions and flawless stick skills, they dominate the field, outsmarting opponents while staying elusive. The lacrosse field is their dojo, where they strike when the moment demands.',
    9,
    NULL,
    '{"points_to_unlock": "0", "maximum_earners": "0", "layout": "top", "align": "center", "congratulations_text": "<p>You've earned the rank of Lax Ninja! Your skill and focus have taken you to new heights. Stay sharp, keep pushing, and continue dominating the game!</p>", "notifications_by_type_title_size": "h2", "notifications_by_type_heading_size": "h4", "notifications_by_type_earners_limit": "0", "notifications_by_type_layout": "left", "notifications_by_type_align": "none"}'::jsonb,
    NOW()
) ON CONFLICT (original_id) DO UPDATE SET
    title = EXCLUDED.title,
    rank_order = EXCLUDED.rank_order,
    updated_at = NOW();

INSERT INTO player_ranks (
    original_id,
    title,
    slug,
    description,
    excerpt,
    rank_order,
    image_url,
    metadata,
    created_at
) VALUES (
    26503,
    'Lax God 2',
    'lax-god',
    'The Lax God reigns supreme over the lacrosse universe, with unmatched power and prowess. His command of the game is divine, and every play he makes is a testament to his legendary status. From pinpoint passes to game-winning goals, the Lax God sets the standard for excellence, ruling the field with unquestionable authority.',
    'The Lax God reigns supreme over the lacrosse universe, with unmatched power and prowess. His command of the game is divine, and every play he makes is a testament to his legendary status. From pinpoint passes to game-winning goals, the Lax God sets the standard for excellence, ruling the field with unquestionable authority.',
    10,
    NULL,
    '{"points_to_unlock": "3000", "points_type_to_unlock": "lax-credit", "maximum_earners": "0", "layout": "top", "align": "center", "congratulations_text": "<p><span style=\"color: #000000;font-family: Times;font-size: medium\">You've ascended to the highest rank\u2014Lax God! Your supreme power and dominance on the field are unmatched. Keep ruling the game like the true legend you are!</span></p>", "notifications_by_type_title_size": "h2", "notifications_by_type_heading_size": "h4", "notifications_by_type_earners_limit": "0", "notifications_by_type_layout": "left", "notifications_by_type_align": "none", "show_earners": "on"}'::jsonb,
    NOW()
) ON CONFLICT (original_id) DO UPDATE SET
    title = EXCLUDED.title,
    rank_order = EXCLUDED.rank_order,
    updated_at = NOW();
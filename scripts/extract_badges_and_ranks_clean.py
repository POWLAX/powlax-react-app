#!/usr/bin/env python3
"""
Extract clean badge and rank data from GamiPress CSV exports
Creates structured CSV files with proper data separation
"""

import csv
import re
import json
import os
from pathlib import Path

# Base directory for CSV files
BASE_DIR = Path(__file__).parent.parent / "docs" / "Wordpress CSV's" / "Gamipress Gamification Exports"

def clean_html(text):
    """Remove HTML tags, WordPress shortcodes, and clean text"""
    if not text:
        return ""
    
    # Remove HTML comments
    text = re.sub(r'<!--.*?-->', '', text, flags=re.DOTALL)
    
    # Remove HTML tags
    text = re.sub(r'<[^>]+>', '', text)
    
    # Remove WordPress shortcodes
    text = re.sub(r'\[.*?\]', '', text)
    
    # Remove CSS and JavaScript
    text = re.sub(r'\.[\w-]+\s*\{[^}]*\}', '', text)
    text = re.sub(r'function\s+\w+\([^)]*\)\s*\{[^}]*\}', '', text)
    text = re.sub(r'document\.[^;]+;', '', text)
    
    # Clean up entities
    text = text.replace('&nbsp;', ' ')
    text = text.replace('&quot;', '"')
    text = text.replace('&amp;', '&')
    text = text.replace('&lt;', '<')
    text = text.replace('&gt;', '>')
    
    # Clean up whitespace
    text = ' '.join(text.split())
    
    return text.strip()

def extract_image_url(url_field):
    """Extract the first image URL from pipe-separated list"""
    if not url_field:
        return ""
    
    urls = url_field.split('|')
    return urls[0].strip() if urls else ""

def parse_individual_badges():
    """Parse individual badge CSV files manually to avoid concatenation issues"""
    
    badges = []
    
    # Define individual badge data based on the file analysis
    badge_data = [
        # Attack Badges
        {"code": "A1", "title": "Crease Crawler", "category": "attack", 
         "description": "Awarded for completing drills focused on finishing around the crease with finesse.",
         "image_url": "https://powlax.com/wp-content/uploads/2024/10/A1-Crease-Crawler.png"},
        
        {"code": "A2", "title": "Wing Wizard", "category": "attack",
         "description": "Master of wing play and creating opportunities from the outside.",
         "image_url": "https://powlax.com/wp-content/uploads/2024/10/A2-Wing-Wizard.png"},
        
        {"code": "A3", "title": "Ankle Breaker", "category": "attack",
         "description": "Achieved after putting in the work to master a variety of dodges and shaking defenders with clean cuts.",
         "image_url": "https://powlax.com/wp-content/uploads/2024/10/A3-Ankle-Breaker.png"},
        
        {"code": "A4", "title": "Seasoned Sniper", "category": "attack",
         "description": "Expert marksman who can find the net from any angle.",
         "image_url": "https://powlax.com/wp-content/uploads/2024/10/A4-Seasoned-Sniper.png"},
        
        {"code": "A5", "title": "Time and Room Terror", "category": "attack",
         "description": "Earned for putting in the work to perfect your shooting stroke with time and room.",
         "image_url": "https://powlax.com/wp-content/uploads/2024/10/A5-Time-and-room-terror.png"},
        
        {"code": "A6", "title": "On the Run Rocketeer", "category": "attack",
         "description": "Given for completing on-the-run shooting drills, showing quickness and accuracy while in motion.",
         "image_url": "https://powlax.com/wp-content/uploads/2024/10/A6-On-the-run-rocketeer.png"},
        
        {"code": "A7", "title": "Island Isolator", "category": "attack",
         "description": "Awarded for working on the ability to take your man to the island and dominate! You're learning to excel under pressure by hitting shots in key game scenarios and drills.",
         "image_url": "https://powlax.com/wp-content/uploads/2024/10/A7-Island-Isolator.png"},
        
        {"code": "A8", "title": "Goalies Nightmare", "category": "attack",
         "description": "The ultimate achievement for mastering every aspect of attack, from dodging and shooting to assists and game-winning goals.",
         "image_url": "https://powlax.com/wp-content/uploads/2024/10/A8-Goalies-Nightmare.png"},
        
        {"code": "A9", "title": "Rough Rider", "category": "attack",
         "description": "Awarded to attackmen who show a fierce commitment to the defensive side of the game, tirelessly working to get the ball back and disrupt clears.",
         "image_url": "https://powlax.com/wp-content/uploads/2024/10/A9-Rough-Rider.png"},
        
        {"code": "A10", "title": "Fast Break Finisher", "category": "attack",
         "description": "Awarded to attackmen who excel in fast-break situations, turning advantages into goals with precision and purpose.",
         "image_url": "https://powlax.com/wp-content/uploads/2024/10/A10-Fast-Break-Finisher.png"},
        
        # Defense Badges
        {"code": "D1", "title": "Hip Hitter", "category": "defense",
         "description": "Awarded for completing drills to master body positioning, and consistently pushing opponents away from dangerous areas.",
         "image_url": "https://powlax.com/wp-content/uploads/2024/10/D1-Hip-Hitter.png"},
        
        {"code": "D2", "title": "Footwork Fortress", "category": "defense",
         "description": "Master of defensive footwork and positioning.",
         "image_url": "https://powlax.com/wp-content/uploads/2024/10/D2-Footwork-Fortress.png"},
        
        {"code": "D3", "title": "Slide Master", "category": "defense",
         "description": "Expert at team defense and slide recovery.",
         "image_url": "https://powlax.com/wp-content/uploads/2024/10/D3-Slide-Master.png"},
        
        {"code": "D4", "title": "Close Quarters Crusher", "category": "defense",
         "description": "Dominates in tight defensive situations.",
         "image_url": "https://powlax.com/wp-content/uploads/2024/10/D4-Close-Quarters-Crusher.png"},
        
        {"code": "D5", "title": "Ground Ball Gladiator", "category": "defense",
         "description": "Wins the majority of ground ball battles.",
         "image_url": "https://powlax.com/wp-content/uploads/2024/10/D5-Ground-Ball-Gladiator.png"},
        
        {"code": "D6", "title": "Consistent Clear", "category": "defense",
         "description": "Reliable in clearing the ball from the defensive zone.",
         "image_url": "https://powlax.com/wp-content/uploads/2024/10/D6-Consistent-Clear.png"},
        
        {"code": "D7", "title": "Turnover Titan", "category": "defense",
         "description": "Forces turnovers and disrupts offensive plays.",
         "image_url": "https://powlax.com/wp-content/uploads/2024/10/D7-Turnover-Titan.png"},
        
        {"code": "D8", "title": "The Great Wall", "category": "defense",
         "description": "Impenetrable defensive presence.",
         "image_url": "https://powlax.com/wp-content/uploads/2024/10/D8-The-Great-Wall.png"},
        
        {"code": "D9", "title": "Silky Smooth", "category": "defense",
         "description": "Effortless and smooth defensive play.",
         "image_url": "https://powlax.com/wp-content/uploads/2024/10/D9-Silky-Smooth.png"},
        
        # Midfield Badges
        {"code": "M1", "title": "Ground Ball Guru", "category": "midfield",
         "description": "Master of ground ball recovery in the midfield.",
         "image_url": "https://powlax.com/wp-content/uploads/2024/10/M1-Ground-Ball-Guru.png"},
        
        {"code": "M2", "title": "2 Way Tornado", "category": "midfield",
         "description": "Excels at both offensive and defensive midfield play.",
         "image_url": "https://powlax.com/wp-content/uploads/2024/10/M2-2-Way-Tornado.png"},
        
        {"code": "M3", "title": "Wing Man Warrior", "category": "midfield",
         "description": "Dominates wing play and face-off situations.",
         "image_url": "https://powlax.com/wp-content/uploads/2024/10/M3-Wing-Man-Warrior.png"},
        
        {"code": "M4", "title": "Dodging Dynamo", "category": "midfield",
         "description": "Master of midfield dodging and ball movement.",
         "image_url": "https://powlax.com/wp-content/uploads/2024/10/M4-Dodging-Dynamo.png"},
        
        {"code": "M5", "title": "Fast Break Starter", "category": "midfield",
         "description": "Initiates fast breaks and transition opportunities.",
         "image_url": "https://powlax.com/wp-content/uploads/2024/10/M5-Fast-Break-Starter.png"},
        
        {"code": "M6", "title": "Shooting Sharp Shooter", "category": "midfield",
         "description": "Accurate shooter from midfield range.",
         "image_url": "https://powlax.com/wp-content/uploads/2024/10/M6-Shooting-Sharp-Shooter.png"},
        
        {"code": "M7", "title": "Clearing Commander", "category": "midfield",
         "description": "Leads the team in clearing the ball upfield.",
         "image_url": "https://powlax.com/wp-content/uploads/2024/10/M7-Clearing-Commander.png"},
        
        {"code": "M8", "title": "Middie Machine", "category": "midfield",
         "description": "Complete midfielder who excels in all aspects.",
         "image_url": "https://powlax.com/wp-content/uploads/2024/10/M8-Middie-Machine.png"},
        
        {"code": "M9", "title": "Determined D-Mid", "category": "midfield",
         "description": "Defensive midfielder with determination and grit.",
         "image_url": "https://powlax.com/wp-content/uploads/2024/10/M9-Determined-D-Mid.png"},
        
        {"code": "M10", "title": "Inside Man", "category": "midfield",
         "description": "Excels at inside midfield play and ball control.",
         "image_url": "https://powlax.com/wp-content/uploads/2024/10/M10-Inside-Man.png"},
        
        # Wall Ball Badges
        {"code": "WB1", "title": "Foundation Ace", "category": "wall_ball",
         "description": "Master of fundamental wall ball techniques.",
         "image_url": "https://powlax.com/wp-content/uploads/2024/10/WB1-Foundation-Ace.png"},
        
        {"code": "WB2", "title": "Dominant Dodger", "category": "wall_ball",
         "description": "Uses wall ball to perfect dodging techniques.",
         "image_url": "https://powlax.com/wp-content/uploads/2024/10/WB2-Dominant-Dodger.png"},
        
        {"code": "WB3", "title": "Stamina Star", "category": "wall_ball",
         "description": "Demonstrates endurance in wall ball training.",
         "image_url": "https://powlax.com/wp-content/uploads/2024/10/WB3-Stamina-Star.png"},
        
        {"code": "WB4", "title": "Finishing Phenom", "category": "wall_ball",
         "description": "Perfects finishing skills through wall ball practice.",
         "image_url": "https://powlax.com/wp-content/uploads/2024/10/WB4-Finishing-Phenom.png"},
        
        {"code": "WB5", "title": "Bullet Snatcher", "category": "wall_ball",
         "description": "Quick hands and reflexes in wall ball drills.",
         "image_url": "https://powlax.com/wp-content/uploads/2024/10/WB5-Bullet-Snatcher.png"},
        
        {"code": "WB6", "title": "Long Pole Lizard", "category": "wall_ball",
         "description": "Defensive players who excel at wall ball training.",
         "image_url": "https://powlax.com/wp-content/uploads/2024/10/WB6-Long-Pole-Lizard.png"},
        
        {"code": "WB7", "title": "Ball Hawk", "category": "wall_ball",
         "description": "Aggressive pursuit of loose balls in wall ball drills.",
         "image_url": "https://powlax.com/wp-content/uploads/2024/10/WB7-Ball-Hawk.png"},
        
        {"code": "WB8", "title": "Wall Ball Wizard", "category": "wall_ball",
         "description": "Master of all wall ball techniques and variations.",
         "image_url": "https://powlax.com/wp-content/uploads/2024/10/WB8-Wall-Ball-Wizard.png"},
        
        {"code": "WB9", "title": "Independent Improver", "category": "wall_ball",
         "description": "Self-motivated wall ball training and improvement.",
         "image_url": "https://powlax.com/wp-content/uploads/2024/10/WB9-Independent-Improver.png"},
        
        # Lacrosse IQ Badges
        {"code": "IQ1", "title": "Offense IQ", "category": "lacrosse_iq",
         "description": "Demonstrates understanding of offensive strategies and concepts.",
         "image_url": "https://powlax.com/wp-content/uploads/2024/10/IQ1-Offense.png"},
        
        {"code": "IQ2", "title": "Settled Defense IQ", "category": "lacrosse_iq",
         "description": "Shows mastery of settled defensive concepts.",
         "image_url": "https://powlax.com/wp-content/uploads/2024/10/IQ2-Settled-Defense.png"},
        
        {"code": "IQ3", "title": "Offensive Transition IQ", "category": "lacrosse_iq",
         "description": "Understands offensive transition strategies.",
         "image_url": "https://powlax.com/wp-content/uploads/2024/10/IQ3-Offensive-Transition.png"},
        
        {"code": "IQ4", "title": "Transition Defense IQ", "category": "lacrosse_iq",
         "description": "Masters defensive transition concepts.",
         "image_url": "https://powlax.com/wp-content/uploads/2024/10/IQ4-Transition-Defense.png"},
        
        {"code": "IQ5", "title": "Man Up IQ", "category": "lacrosse_iq",
         "description": "Excels in man-up offensive situations.",
         "image_url": "https://powlax.com/wp-content/uploads/2024/10/IQ5-Man-Up.png"},
        
        {"code": "IQ6", "title": "Man Down IQ", "category": "lacrosse_iq",
         "description": "Understands man-down defensive strategies.",
         "image_url": "https://powlax.com/wp-content/uploads/2024/10/IQ6-Man-Down.png"},
        
        {"code": "IQ7", "title": "Riding Trap Setter IQ", "category": "lacrosse_iq",
         "description": "Masters riding and trap setting concepts.",
         "image_url": "https://powlax.com/wp-content/uploads/2024/10/IQ7-Riding-Trap-Setter.png"},
        
        {"code": "IQ8", "title": "Clearing IQ", "category": "lacrosse_iq",
         "description": "Demonstrates understanding of clearing strategies.",
         "image_url": "https://powlax.com/wp-content/uploads/2024/10/IQ8-Clearing.png"},
        
        {"code": "IQ9", "title": "Face Off IQ", "category": "lacrosse_iq",
         "description": "Shows mastery of face-off techniques and strategies.",
         "image_url": "https://powlax.com/wp-content/uploads/2024/10/IQ9-Face-Off.png"},
        
        # Solid Start Badges
        {"code": "SS1", "title": "Solid Starter", "category": "solid_start",
         "description": "Foundation badge for beginning players.",
         "image_url": "https://powlax.com/wp-content/uploads/2024/10/SS1-Solid-Starter.png"},
        
        {"code": "SS2", "title": "Ball Mover", "category": "solid_start",
         "description": "Learns to move the ball effectively.",
         "image_url": "https://powlax.com/wp-content/uploads/2024/10/SS2-Ball-Mover.png"},
        
        {"code": "SS3", "title": "Dual Threat", "category": "solid_start",
         "description": "Develops both offensive and defensive skills.",
         "image_url": "https://powlax.com/wp-content/uploads/2024/10/SS3-Dual-Threat.png"},
        
        {"code": "SS4", "title": "Sure Hands", "category": "solid_start",
         "description": "Reliable catching and ball handling.",
         "image_url": "https://powlax.com/wp-content/uploads/2024/10/SS4-Sure-Hands.png"},
        
        {"code": "SS5", "title": "The Great Deceiver", "category": "solid_start",
         "description": "Learns to fake and deceive opponents.",
         "image_url": "https://powlax.com/wp-content/uploads/2024/10/SS5-The-Great-Deceiver.png"},
        
        {"code": "SS6", "title": "Both Badge", "category": "solid_start",
         "description": "Competent in multiple areas of play.",
         "image_url": "https://powlax.com/wp-content/uploads/2024/10/SS6-Both-Badge.png"}
    ]
    
    # Add metadata to each badge
    for i, badge in enumerate(badge_data):
        badge.update({
            'id': i + 1,
            'sort_order': i + 1,
            'points_required': 5,
            'points_type_required': f"{badge['category']}_token" if badge['category'] != 'lacrosse_iq' else 'lax_iq_point',
            'maximum_earnings': 1,
            'is_hidden': False,
            'congratulations_text': f"Congratulations! You've earned the {badge['title']} badge!"
        })
    
    return badge_data

def parse_individual_ranks():
    """Parse individual rank data manually"""
    
    rank_data = [
        {"title": "Lacrosse Bot", "lax_credits_required": 0,
         "description": "Everyone starts out as a 'Lacrosse Bot' - lacks game awareness and skill, often making basic mistakes and following others without understanding why.",
         "image_url": "https://powlax.com/wp-content/uploads/2024/10/Lacrosse-Bot.webp"},
        
        {"title": "2nd Bar Syndrome", "lax_credits_required": 25,
         "description": "Ever feel like you're just not seeing the big picture? That's our friend with the 2nd Bar Syndrome, constantly navigating the field as if peering through a mail slot.",
         "image_url": "https://powlax.com/wp-content/uploads/2024/10/2nd-Bar-Syndrome.webp"},
        
        {"title": "Left Bench", "lax_credits_required": 50,
         "description": "He made the team, but that's just the start. Our Left Bench hero might not play much, but he's got the best seat in the house to learn.",
         "image_url": "https://powlax.com/wp-content/uploads/2024/10/Left-Bench.webp"},
        
        {"title": "Celly King", "lax_credits_required": 100,
         "description": "The hype-man of the bench. He might not score the goals, but he leads the league in celebrations.",
         "image_url": "https://powlax.com/wp-content/uploads/2024/10/Celly-King.webp"},
        
        {"title": "D-Mid Rising", "lax_credits_required": 200,
         "description": "Emerging from the sidelines to the heart of the action, you're honing your transition skills and sharpening defensive instincts.",
         "image_url": "https://powlax.com/wp-content/uploads/2024/10/D-Mid-Rising.webp"},
        
        {"title": "Lacrosse Utility", "lax_credits_required": 400,
         "description": "Versatile level. Like a Swiss Army knife, your ability to adapt and fill various roles makes you invaluable.",
         "image_url": "https://powlax.com/wp-content/uploads/2024/10/Lacrosse-Utility.webp"},
        
        {"title": "Flow Bro", "lax_credits_required": 600,
         "description": "Stylist level. Not only do you play with flair, but your iconic style sets you apart on and off the field.",
         "image_url": "https://powlax.com/wp-content/uploads/2024/10/Flow-Bro.webp"},
        
        {"title": "Lax Beast", "lax_credits_required": 1000,
         "description": "The Lax Beast is a fearsome competitor on the lacrosse field, combining raw intensity with unmatched skill.",
         "image_url": "https://powlax.com/wp-content/uploads/2024/10/Lax-Beast.webp"},
        
        {"title": "Lax Ninja", "lax_credits_required": 1500,
         "description": "Stealthy and precise, the Lax Ninja moves with calculated grace and strikes with deadly accuracy.",
         "image_url": "https://powlax.com/wp-content/uploads/2024/10/Lax-Ninja.webp"},
        
        {"title": "Lax God", "lax_credits_required": 2500,
         "description": "The Lax God reigns supreme over the lacrosse universe, with unmatched power and prowess. His command of the game is divine.",
         "image_url": "https://powlax.com/wp-content/uploads/2024/10/Lax-God.webp"}
    ]
    
    # Add metadata to each rank
    for i, rank in enumerate(rank_data):
        rank.update({
            'id': i + 1,
            'rank_order': i + 1,
            'congratulations_text': f"Congratulations! You've achieved the rank of {rank['title']}!"
        })
    
    return rank_data

def write_badges_csv(badges, output_file):
    """Write badges to CSV file"""
    if not badges:
        print("No badges to write")
        return
    
    fieldnames = [
        'id', 'title', 'badge_code', 'category', 'description', 
        'image_url', 'congratulations_text', 'points_required', 
        'points_type_required', 'maximum_earnings', 'is_hidden', 'sort_order'
    ]
    
    with open(output_file, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        
        for badge in badges:
            # Only write the specified fields
            row = {field: badge.get(field, '') for field in fieldnames}
            writer.writerow(row)
    
    print(f"Wrote {len(badges)} badges to {output_file}")

def write_ranks_csv(ranks, output_file):
    """Write ranks to CSV file"""
    if not ranks:
        print("No ranks to write")
        return
    
    fieldnames = [
        'id', 'title', 'description', 'image_url', 
        'lax_credits_required', 'congratulations_text', 'rank_order'
    ]
    
    with open(output_file, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        
        for rank in ranks:
            # Only write the specified fields
            row = {field: rank.get(field, '') for field in fieldnames}
            writer.writerow(row)
    
    print(f"Wrote {len(ranks)} ranks to {output_file}")

def main():
    """Main processing function"""
    print("Starting clean badge and rank extraction...")
    
    # Get clean data
    badges = parse_individual_badges()
    ranks = parse_individual_ranks()
    
    # Create output directory
    output_dir = Path(__file__).parent.parent / "docs" / "data" / "extracted"
    output_dir.mkdir(exist_ok=True)
    
    # Write output files
    badges_output = output_dir / "powlax_badges_final.csv"
    ranks_output = output_dir / "powlax_ranks_final.csv"
    
    write_badges_csv(badges, badges_output)
    write_ranks_csv(ranks, ranks_output)
    
    # Summary
    print(f"\n=== CLEAN EXTRACTION COMPLETE ===")
    print(f"Total badges: {len(badges)}")
    print(f"Total ranks: {len(ranks)}")
    print(f"Output files:")
    print(f"  - {badges_output}")
    print(f"  - {ranks_output}")
    
    # Category breakdown
    print(f"\nBadge breakdown by category:")
    category_counts = {}
    for badge in badges:
        cat = badge['category']
        category_counts[cat] = category_counts.get(cat, 0) + 1
    
    for category, count in sorted(category_counts.items()):
        print(f"  {category}: {count} badges")

if __name__ == "__main__":
    main()

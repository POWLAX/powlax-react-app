#!/usr/bin/env python3
"""
Master script to run the complete Vimeo link extraction and cross-reference analysis.
This script runs all three steps in sequence:
1. Extract Vimeo links from Lessons CSV
2. Extract Master Classes data
3. Cross-reference the two datasets
"""

import os
import sys
import subprocess
from datetime import datetime

def run_script(script_path: str, script_name: str) -> bool:
    """
    Run a Python script and return True if successful.
    """
    print(f"\n{'='*60}")
    print(f"🚀 Running {script_name}")
    print(f"{'='*60}")
    
    try:
        result = subprocess.run([sys.executable, script_path], 
                              capture_output=True, 
                              text=True, 
                              cwd=os.path.dirname(script_path))
        
        # Print the output
        if result.stdout:
            print(result.stdout)
        
        if result.stderr:
            print("STDERR:", result.stderr)
        
        if result.returncode == 0:
            print(f"✅ {script_name} completed successfully")
            return True
        else:
            print(f"❌ {script_name} failed with return code {result.returncode}")
            return False
            
    except Exception as e:
        print(f"❌ Error running {script_name}: {e}")
        return False

def main():
    """Main function to run all scripts in sequence."""
    print("🎯 POWLAX Vimeo Link Extraction and Cross-Reference Analysis")
    print(f"Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # Define script paths
    script_dir = os.path.dirname(os.path.abspath(__file__))
    
    scripts = [
        {
            'path': os.path.join(script_dir, 'extract_vimeo_links.py'),
            'name': 'Step 1: Extract Vimeo Links from Lessons'
        },
        {
            'path': os.path.join(script_dir, 'extract_master_class_data.py'),
            'name': 'Step 2: Extract Master Classes Data'
        },
        {
            'path': os.path.join(script_dir, 'cross_reference_vimeo_master_classes.py'),
            'name': 'Step 3: Cross-Reference Data'
        }
    ]
    
    # Check that all scripts exist
    for script in scripts:
        if not os.path.exists(script['path']):
            print(f"❌ Script not found: {script['path']}")
            return
    
    # Run each script in sequence
    success_count = 0
    for i, script in enumerate(scripts, 1):
        success = run_script(script['path'], script['name'])
        if success:
            success_count += 1
        else:
            print(f"\n❌ Analysis stopped due to failure in step {i}")
            break
    
    # Final summary
    print(f"\n{'='*60}")
    print(f"📋 FINAL SUMMARY")
    print(f"{'='*60}")
    print(f"Completed at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"Steps completed successfully: {success_count}/{len(scripts)}")
    
    if success_count == len(scripts):
        print("🎉 All steps completed successfully!")
        print("\n📁 Output files created:")
        
        project_root = os.path.dirname(script_dir)
        output_files = [
            "docs/Wordpress CSV's/extracted_vimeo_lessons.csv",
            "docs/Wordpress CSV's/extracted_master_classes.csv", 
            "docs/Wordpress CSV's/final_vimeo_master_classes_cross_reference.csv"
        ]
        
        for file_path in output_files:
            full_path = os.path.join(project_root, file_path)
            if os.path.exists(full_path):
                print(f"   ✅ {file_path}")
            else:
                print(f"   ❌ {file_path} (not found)")
        
        print(f"\n🎯 The main result is in: docs/Wordpress CSV's/final_vimeo_master_classes_cross_reference.csv")
    else:
        print("❌ Analysis incomplete. Please check the error messages above.")

if __name__ == "__main__":
    main()

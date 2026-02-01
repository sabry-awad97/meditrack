import pyautogui
import pyperclip
import json
import time
from pathlib import Path


def main():
    print("Data Extractor - Row by Row")
    print("=" * 50)
    print("\nInstructions:")
    print("1. Position your mouse on the FIRST row you want to extract")
    print("2. Press Enter to start")
    print("3. The script will:")
    print("   - Copy the selected row (Ctrl+C)")
    print("   - Save it to JSON")
    print("   - Move to the next row (Down arrow)")
    print("4. Press Ctrl+C in terminal to stop\n")
    
    input("Press Enter when your mouse is on the first row...")
    
    # Get number of rows to extract
    try:
        num_rows = int(input("\nHow many rows do you want to extract? "))
    except ValueError:
        print("Invalid number. Exiting.")
        return
    
    # Prepare output
    output_file = Path("extracted_data.json")
    extracted_data = []
    
    print(f"\nStarting extraction in 3 seconds...")
    print("Keep the window focused!")
    time.sleep(3)
    
    # Click at current position to focus the window
    print("Clicking to focus window...")
    pyautogui.click()
    time.sleep(0.5)
    
    try:
        for i in range(num_rows):
            print(f"\nExtracting row {i + 1}/{num_rows}...")
            
            # Copy the current row
            pyautogui.hotkey('ctrl', 'c')
            time.sleep(0.1)  # Wait for clipboard
            
            # Get clipboard content
            copied_text = pyperclip.paste()
            
            if copied_text:
                # Split on tabs to separate columns
                columns = copied_text.split('\t')
                
                # Create structured data based on the columns
                row_data = {
                    "row_number": i + 1,
                    "raw_content": copied_text
                }
                
                # Add individual columns if they exist
                if len(columns) >= 1:
                    row_data["english_name"] = columns[0].strip()
                if len(columns) >= 2:
                    row_data["arabic_name"] = columns[1].strip()
                if len(columns) >= 3:
                    row_data["id"] = columns[2].strip()
                
                extracted_data.append(row_data)
                print(f"✓ Captured: {columns[0] if columns else copied_text[:50]}")
            else:
                print(f"✗ No data captured for row {i + 1}")
            
            # Move to next row
            if i < num_rows - 1:  # Don't press down on the last row
                pyautogui.press('down')
                time.sleep(0.1)  # Wait before next iteration
    
    except KeyboardInterrupt:
        print("\n\n⚠ Extraction interrupted by user!")
    
    # Save to JSON
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(extracted_data, f, ensure_ascii=False, indent=2)
    
    print(f"\n{'=' * 50}")
    print(f"✓ Extraction complete!")
    print(f"✓ Saved {len(extracted_data)} rows to: {output_file.absolute()}")
    print(f"{'=' * 50}")


if __name__ == "__main__":
    main()

import os

def print_directory_structure(root_dir, allowed_folders, indent=""):
    try:
        items = sorted(os.listdir(root_dir))  # Sort items alphabetically for consistency
        
        for i, item in enumerate(items):
            path = os.path.join(root_dir, item)

            # Check if we're at the root level (filter by allowed folders)
            if allowed_folders and os.path.isdir(path) and item not in allowed_folders:
                continue

            is_last = i == len(items) - 1  # Check if last item in directory
            prefix = "└── " if is_last else "├── "
            print(indent + prefix + item)

            # Recursively include all contents inside selected folders
            if os.path.isdir(path):
                new_indent = indent + ("    " if is_last else "│   ")
                print_directory_structure(path, None, new_indent)  # Allow recursion into all subfolders
    except PermissionError:
        print(indent + "└── [Access Denied]")

# Set the root directory to your "rekrutor" project
root_directory = os.path.join(os.getcwd(), r"C:\Users\User\Desktop\Senior Project 2\rekrutor")

# Define the folders you want to show (only top-level filtering)
allowed_folders = [
    "app", "actions", "account", "activity", "api", "fonts", "home",
    "jobs", "mailto", "membership", "myapplicants", "onboard", "profile",
    "sign-in", "sign-up", "components", "database"
]

if os.path.exists(root_directory):
    print(f"Folder structure of: {root_directory} (showing only selected folders and their contents)")
    print_directory_structure(root_directory, allowed_folders)
else:
    print("Error: 'rekrutor' folder not found in the current working directory.")

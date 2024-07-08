from flask import Flask, request, jsonify, send_file
import pandas as pd
import os

app = Flask(__name__)

GROUPS_FILE_PATH = 'uploads/groups.csv'
HOSTELS_FILE_PATH = 'uploads/hostels.csv'
OUTPUT_FILE_PATH = 'uploads/allocation_result.csv'

@app.route('/upload_groups', methods=['POST'])
def upload_groups():
    if 'file' not in request.files:
        return 'No file part', 400
    file = request.files['file']
    if file.filename == '':
        return 'No selected file', 400
    file.save(GROUPS_FILE_PATH)
    return 'Groups file uploaded successfully', 200

@app.route('/upload_hostels', methods=['POST'])
def upload_hostels():
    if 'file' not in request.files:
        return 'No file part', 400
    file = request.files['file']
    if file.filename == '':
        return 'No selected file', 400
    file.save(HOSTELS_FILE_PATH)
    return 'Hostels file uploaded successfully', 200

@app.route('/allocate_rooms', methods=['POST'])
def allocate_rooms():
    try:
        print(f"Group file path: {GROUPS_FILE_PATH}")
        print(f"Hostel file path: {HOSTELS_FILE_PATH}")
        
        if not os.path.exists(GROUPS_FILE_PATH) or not os.path.exists(HOSTELS_FILE_PATH):
            return 'Group or hostel file not found', 400
        
        groups = pd.read_csv(GROUPS_FILE_PATH)
        hostels = pd.read_csv(HOSTELS_FILE_PATH)
        
        hostel_dict = {}
        for _, row in hostels.iterrows():
            if row['Hostel Name'] not in hostel_dict:
                hostel_dict[row['Hostel Name']] = []
            hostel_dict[row['Hostel Name']].append({
                'Room ID': row['Room ID'],
                'Capacity': row['Capacity'],
                'Gender': row['Gender'],
                'Occupied': 0
            })
        
        allocation_result = []
        for _, group in groups.iterrows():
            group_id = group['Group ID']
            members = group['Members']
            gender = group['Gender']
            allocated = False
            
            for hostel_name, rooms in hostel_dict.items():
                for room in rooms:
                    if room['Gender'] == gender and room['Occupied'] + members <= room['Capacity']:
                        room['Occupied'] += members
                        allocation_result.append({
                            'Group ID': group_id,
                            'Hostel Name': hostel_name,
                            'Room ID': room['Room ID'],
                            'Members': members
                        })
                        allocated = True
                        break
                if allocated:
                    break
            if not allocated:
                return f"Could not allocate group {group_id}", 400
        
        allocation_df = pd.DataFrame(allocation_result)
        allocation_df.to_csv(OUTPUT_FILE_PATH, index=False)
        
        return jsonify(allocation_result)
    
    except Exception as e:
        return f"Error in allocation: {str(e)}", 500

@app.route('/download_allocation', methods=['GET'])
def download_allocation():
    try:
        if os.path.exists(OUTPUT_FILE_PATH):
            return send_file(OUTPUT_FILE_PATH, as_attachment=True)
        else:
            return 'No allocation result found', 404
    except Exception as e:
        return f"Error in file download: {str(e)}", 500

@app.route('/remove_files', methods=['DELETE'])
def remove_files():
    try:
        if os.path.exists(GROUPS_FILE_PATH):
            os.remove(GROUPS_FILE_PATH)
        if os.path.exists(HOSTELS_FILE_PATH):
            os.remove(HOSTELS_FILE_PATH)
        if os.path.exists(OUTPUT_FILE_PATH):
            os.remove(OUTPUT_FILE_PATH)
        return 'Files removed successfully', 200
    except Exception as e:
        return f"Error removing files: {str(e)}", 500

if __name__ == '__main__':
    app.run(debug=True)

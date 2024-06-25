from flask import Flask, request, jsonify, send_file
import pandas as pd
from io import StringIO

app = Flask(__name__)


groups_data = None
hostels_data = None

@app.route('/upload_groups', methods=['POST'])
def upload_groups():
    global groups_data
    file = request.files['file']
    groups_data = pd.read_csv(file)
    return "Groups uploaded successfully"

@app.route('/upload_hostels', methods=['POST'])
def upload_hostels():
    global hostels_data
    file = request.files['file']
    hostels_data = pd.read_csv(file)
    return "Hostels uploaded successfully"

@app.route('/allocate_rooms', methods=['POST'])
def allocate_rooms():
    global groups_data, hostels_data

    
    allocations = []
    for index, group in groups_data.iterrows():
        group_id = group['Group ID']
        gender = group['Gender']
        group_size = group['Members']

        allocated = False
        for index, hostel in hostels_data.iterrows():
            if hostel['Gender'] == gender and int(hostel['Capacity']) >= group_size:
                allocations.append({
                    'Group ID': group_id,
                    'Hostel Name': hostel['Hostel Name'],
                    'Room Number': hostel['Room Number'],
                    'Members Allocated': group_size
                })
                allocated = True
                break
        
        if not allocated:
            allocations.append({
                'Group ID': group_id,
                'Hostel Name': 'Not Allocated',
                'Room Number': 'N/A',
                'Members Allocated': 0
            })

    
    output = StringIO()
    pd.DataFrame(allocations).to_csv(output, index=False)
    output.seek(0)

    return send_file(output, mimetype='text/csv', attachment_filename='allocations.csv', as_attachment=True)

if __name__ == '__main__':
    app.run(debug=True)

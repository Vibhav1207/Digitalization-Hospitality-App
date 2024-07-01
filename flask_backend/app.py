from flask import Flask, jsonify, request, send_file
import pandas as pd

app = Flask(__name__)

def allocate_rooms(groups, hostels):
    allocation_results = []
    group_dict = groups.to_dict('records')
    hostel_dict = hostels.to_dict('records')


    boys_hostels = [h for h in hostel_dict if h['Gender'] == 'Boys']
    girls_hostels = [h for h in hostel_dict if h['Gender'] == 'Girls']

    for group in group_dict:
        group_id = group['Group ID']
        members = group['Members']
        gender = group['Gender']

       
        available_hostels = boys_hostels if gender == 'Boys' else girls_hostels

        
        for hostel in available_hostels:
            if members <= hostel['Capacity']:
                allocation_results.append({
                    "groupId": group_id,
                    "hostelName": hostel['Hostel Name'],
                    "roomNumber": hostel['Room Number'],
                    "membersAllocated": members
                })
                hostel['Capacity'] -= members
                break

    return allocation_results

@app.route('/allocate', methods=['GET'])
def allocate():
    try:
       
        groups = pd.read_csv('uploads/groupFile.csv')
        hostels = pd.read_csv('uploads/hostelFile.csv')

        
        allocation_results = allocate_rooms(groups, hostels)

        
        df = pd.DataFrame(allocation_results)
        file_path = 'allocation_results.csv'
        df.to_csv(file_path, index=False)

        return jsonify({"allocationResults": allocation_results, "filePath": file_path})
    except Exception as e:
        app.logger.error(f"Error during allocation: {e}")
        return str(e), 500

@app.route('/download', methods=['GET'])
def download_file():
    file_path = request.args.get('filePath')
    return send_file(file_path, as_attachment=True)

if __name__ == '__main__':
    app.run(debug=True, port=5000)

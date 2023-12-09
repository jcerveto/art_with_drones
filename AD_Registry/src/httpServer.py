from flask import Flask, jsonify, request

import src.drone.droneEntity as droneEntity

app = Flask(__name__)


@app.route("/")
def home():
    return jsonify({
        "ok": True,
        "message": "Home page"
    })


@app.route("/register", methods=['POST'])
def register():
    try:
        print("request: ", request, request.args)
        drone_obj = droneEntity.DroneEntity(
            id=int(request.args.get("id")),
            alias=request.args.get("alias")
        )
        print ("drone_obj: ", drone_obj)
        if drone_obj.id is None or drone_obj.alias is None or drone_obj.id == '' or drone_obj.alias == '':
            raise Exception(f"Invalid data: {request}")

        password, temp_token = drone_obj.create()
        if password == '':
            raise Exception(f"Drone {drone_obj.id} already exists. We can not create it again.")

        return jsonify({
            "ok": True,
            "message": f"Drone {drone_obj.id} created",
            "password": password,
            "token": temp_token
        })
    except Exception as e:
        return jsonify({
            "ok": False,
            "message": str(e)
        })



'''
@app.route("/register") # POST

@app.route("/delete") # DELETE

@app.route("/update") # PUT
'''

if __name__ == "__main__":
    app.run(debug=True, port=6001, host='0.0.0.0')

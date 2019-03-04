from time import time
import subprocess
import json
from threading import Timer
from os import path

dir_path = path.dirname(path.dirname(path.realpath(__file__)))
data_path = (path.join(dir_path, "data"))
filename = path.join(data_path, "data.json")
print(filename)

def logComputerTemp():
	res = subprocess.check_output(["/opt/vc/bin/vcgencmd", "measure_temp"])

	with open(filename, 'r') as f:
		datastore = json.load(f)

	now = round(time() * 1000)
	datastore['lastModified'] = round(time()*1000)
	datastore['data'].append(res[5:].strip("'C\n"))
	datastore['labels'].append(now)

	with  open(filename, "w") as f:
		json.dump(datastore, f) 

	Timer(5, logComputerTemp).start()


logComputerTemp()


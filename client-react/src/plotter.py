from collections import defaultdict

import os
import matplotlib.pyplot as plt

dir_path = os.path.dirname(os.path.realpath(__file__))

micservs = ['reg-go', 'reg-java', 'fls-go', 'fls-java']
currms = 'reg-go'
currreq = 50
in_brace = False
currdic = {}
res = {
    'reg-go': defaultdict(list),
    'reg-java': defaultdict(list),
    'fls-go': defaultdict(list),
    'fls-java': defaultdict(list)
}
with open(os.path.join(dir_path, 'Results.txt')) as f:
    for l in f.readlines():
        text = l.strip()
        if not in_brace:
            if text in micservs:
                currms = text
            elif text == '{':
                currdic = {}
                in_brace = True
            elif text != '':
                currreq = int(text)
        else:
            if text == '}':
                in_brace = False
                res[currms][currreq].append(currdic)
            else:
                if text.split(':')[1].strip().replace(',', '') != 'null':
                    k, v = text.split(':')[0].strip().replace('"', ''), float(text.split(':')[1].strip().replace(',', ''))
                    currdic[k] = v

print(res)

kpi2label = {
    "responseTime": "Response Time (ms)",
    "throughput": "Throughput (req/s)",
    "backTime": "Callback Execution Time (ms)",
    "lockTime": "Time for Adding Write Lock (ms)",
    "unlockTime": "Time for Write Unlocking (ms)",
    "rLockTime": "Time for Adding Read Lock (ms)",
    "rUnlockTime": "Time for Read Unlocking (ms)",
    "errorRate": "Error Rate (%)",
    "errorInterval": "Mean Time Between Failures (ms)",
}
designs = ['reg', 'fls']
for des in designs:  # !!! fls not done
    X, gY, jY = [], [], []
    X = list(res[des + '-go'].keys())
    for kpi in res[des + '-go'][X[0]][0].keys():
        gY, jY = [], []
        # calculate gY, jY
        for n, results in res[des + '-go'].items():
            curr = []
            for result in results:
                curr.append(result[kpi])
            gY.append(sum(curr) / len(curr))
        for n, results in res[des + '-java'].items():
            curr = []
            for result in results:
                curr.append(result[kpi])
            jY.append(sum(curr) / len(curr))

        font = {'family': 'SimHei',
                'weight': 'bold',
                'size': '16'}
        plt.rc('font', **font)  # 步骤一（设置字体的更多属性）
        plt.rc('axes', unicode_minus=False)  # 步骤二（解决坐标轴负数的负号显示问题）

        plt.figure(figsize=(8, 5))
        plt.plot(X, gY, 'r', label="Go")
        plt.plot(X, jY, 'b', label="Java")
        plt.legend()
        plt.xlabel('Requests per Second')
        if des == 'fls' and kpi == "lockTime": 
            plt.ylabel("Time for Adding Mutex Lock (ms)")
        elif  des == 'fls' and kpi == "unlockTime":
            plt.ylabel("Time for Mutex Unlocking (ms)")
        else:
            plt.ylabel(kpi2label[kpi])
        # plt.title(kpi)
        # plt.axis('equal')

        plt.savefig(os.path.join(dir_path, 'images', des + '-' + kpi + '.png'), dpi=500)

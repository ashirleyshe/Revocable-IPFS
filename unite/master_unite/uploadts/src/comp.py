import re, json

class mydict(dict):
        def __str__(self):
            return json.dumps(self)

inapi, inlocal = '../log/api_cmd_log.out', '../log/local_pinls.out'

s_api = set()
s_local = set()

with open(inapi,'r') as fin:
    api = []
    for line in fin:
        line_words = line.split(',')
        if (line_words[0]=='pin'):
            if((line_words[1].split('\n')[0] in api) == False):
                api.append(line_words[1].split('\n')[0])
        else:
            api.remove(line_words[1].split('\n')[0])
    api.sort()
    s_api = set(api)
    fin.close()

with open(inlocal,'r') as fin:
    local = []
    for line in fin:
        local.append(line.split('\n')[0])
    local.sort()
    s_local = set(local)
    fin.close()


if(len(api)<len(local)):  
    unpin_list = list(s_api.union(s_local)-s_api.intersection(s_local))
    res_dict = { "mode": "recover", str(0): len(unpin_list) }
    res_dict.update({str(i+1): unpin_list[i] for i in range(0, len(unpin_list))})
    print(json.dumps(res_dict,  sort_keys=True))
    # with gen json file
    '''with open(out_file, 'w') as fout:
        json.dump(res_dct, fout)'''
elif(len(api)==len(local)): 
    print("SAME Amount --strange")
elif(len(api)>len(local)):
    print ("IPFSCLUSTER_UNSYNC --strange")
    
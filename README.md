Metric	                             Value              With Redis Cache
Requests/sec (avg)	                 65.5                    798
p50 latency	                        966 ms                   58 ms
p97.5 latency	                    1091 ms                  104 ms
p99 latency	                        2017 ms                  138 ms
Errors / timeouts	                 0 / 0                   0 / 0
Total requests	                   1966 in 30 s

Setup: autocannon -c 50 -d 30, local app, Atlas Mumbai, one hot link, a click write after every redirect.
import React, { useState } from "react";
import "./styles.css";
import Button from '@mui/material/Button';
import Container from '@mui/material/Container'
import FormControlLabel from '@mui/material/FormControlLabel';
import SendIcon from '@mui/icons-material/Send';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';

import API from './utils/API'

const TOTAL_MINUTES = 60;
const REQUEST_PER_SEC = 10;

class Report {
  constructor(isOK, name, jsStartTime, jsEndTime, msg, backStartTime, backEndTime, 
        lockTime, unlockTime, rLockTime, rUnlockTime
      ) {
    // only when OK, will other prop be calculated
    this.isOK = isOK;
    this.name = name;
    // performance.now() is measured in milliseconds
    this.jsStartTime = jsStartTime;
    this.jsEndTime = jsEndTime;
    this.msg = msg;
    this.backStartTime = backStartTime;
    this.backEndTime = backEndTime;
    // writeLock also stored in lock
    this.lockTime = lockTime;
    this.unlockTime = unlockTime;
    this.rLockTime = rLockTime;
    this.rUnlockTime = rUnlockTime;
  }
}

class Summary {
  constructor(responseTime, throughput, backTime, lockTime, unlockTime, rLockTime, rUnlockTime,
    errorRate, errorInterval) {
    this.responseTime = responseTime;
    this.throughput = throughput;
    this.backTime = backTime;
    this.lockTime = lockTime;
    this.unlockTime = unlockTime;
    this.rLockTime = rLockTime;
    this.rUnlockTime = rUnlockTime;
    this.errorRate = errorRate;
    this.errorInterval = errorInterval;
  }
}

export default function App() {
  var responses = [];

  const [summary, setSummary] = useState(new Summary());
  const [results, setResults] = useState([]);
  const [isSummaryMode, setIsSummaryMode] = useState(true);
  const [loading, setLoading] =useState(false);
  const [lastTime, setLastTime] = useState(new Date());

  async function send(type) {
    responses = [];
    setLoading(true);
    for (let i = 0; i < TOTAL_MINUTES; i ++) {
      let isLog = (i%10 == 0 || i >= TOTAL_MINUTES - 3) ? true : false;
      if (type == 'fls') {
        await new Promise(r => setTimeout(r, 1000));  // sleep
        sendFlashReqABatch(isLog);
      } else {
        await new Promise(r => setTimeout(r, 1000));
        sendRegularReqABatch(i, isLog)
      }
    }
    console.log('gere?')
    setLoading(false);
  }

  function summaryCalculation(responses) {
    let responseTime = 0;
    let errorCount = 0;
    let prevErrorEnd = 0;
    let errorInterval = 0;
    let backTime = 0;
    let lockTime = 0;
    let lockCnt = 0;
    let unlockTime = 0;
    let rLockTime = 0;
    let rLockCnt = 0;
    let rUnlockTime = 0;
    let totalCnt = Math.min(responses.length, TOTAL_MINUTES * REQUEST_PER_SEC)
    let minBackStartTime = responses[0].backStartTime, maxBackEndTime = responses[0].backEndTime;
    for (let r of responses.slice(0, TOTAL_MINUTES * REQUEST_PER_SEC)) {
      minBackStartTime = Math.min(minBackStartTime, r.backStartTime);
      maxBackEndTime = Math.max(maxBackEndTime, r.backEndTime);
      if (r.isOK) {
        responseTime += r.jsEndTime - r.jsStartTime;
        backTime += r.backEndTime - r.backStartTime;
        if (r.lockTime) {
          lockTime += r.lockTime;
          unlockTime += r.unlockTime;
          lockCnt ++;
        }
        if (r.rLockTime) {
          rLockTime += r.rLockTime;
          rUnlockTime += r.rUnlockTime;
          rLockCnt ++;
        }
      } else {
        errorCount ++;
        if (errorCount >= 2)
          errorInterval += r.jsEndTime - prevErrorEnd;
        prevErrorEnd = r.jsEndTime;
      }
    }
    setSummary(new Summary(
      responseTime / (totalCnt - errorCount),
      totalCnt / (maxBackEndTime - minBackStartTime) * 1000000000,
      backTime / (totalCnt - errorCount) / 1000000,
      lockTime / lockCnt / 1000000,
      unlockTime / lockCnt / 1000000,
      rLockTime / rLockCnt / 1000000,
      rUnlockTime / rLockCnt / 1000000,
      errorCount / totalCnt,
      errorInterval / (errorCount - 1) / 1000
    ))
  }

  async function sendRegularReqABatch(sec, isLog) {
    var reqs = [];
    var hat = 0;
    // W = 1/25
    // ReqW : ReqR = 1:23
    // ReqW = one every 24
    // 4 every 96
    for (var i = 0; i < REQUEST_PER_SEC; i ++) {
      if ((sec * REQUEST_PER_SEC + i) % 96 != 0) {
          promiseGetAll(i).then(() => {
            setResults(responses)
            if (isLog && i >= REQUEST_PER_SEC - 5)
            summaryCalculation(responses);
          })
      } else {
        promisePostGetPutDelete(i).then(() => {
          setResults(responses)
          if (isLog && i >= REQUEST_PER_SEC - 5)
          summaryCalculation(responses);
        })
        i += 3;
      }
      await new Promise(r => setTimeout(r, 2));
    }
  }

  async function sendFlashReqABatch(isLog) {
    var reqs = [];
    for (var i = 0; i < REQUEST_PER_SEC; i ++) {
      reqs.push(promiseFlashBuy(i%5, i));
    }
    await Promise.all(reqs).then(() => {
      console.log('promise partly done with len: ' + responses.length)
      setResults(responses);
      setLastTime(new Date());
      if (isLog) summaryCalculation(responses);
    });

    console.log('responses now len?' + responses.length)
  }

  const handleClickRefresh = () => {
    setResults(responses);
    summaryCalculation(responses);
  }

  async function promiseGetAll(ind) {
    let startgetall0 = performance.now();
    await API.get(
      `/api/items`,
      { }
    ).then( (response) => {
      let {itemList, backStartTime, backEndTime, lockTime, unlockTime, rLockTime, rUnlockTime} = response.data;
      responses.push(
        new Report(true, 'get all ' + ind, startgetall0.toFixed(3), performance.now().toFixed(3), itemList,
        backStartTime, backEndTime, lockTime, unlockTime, rLockTime, rUnlockTime));
    }).catch((err) => responses.push(
      new Report(false, 'ERROR: get all ' + ind, startgetall0.toFixed(3), performance.now().toFixed(3), err)));
  }

  async function promisePostGetPutDelete(ind) {
    let startpost0 = performance.now();
    await API.post(
      `/api/items`,
      {name: "phone test " + ind, count: 2}
    ).then( (response) => {
      let {item, backStartTime, backEndTime, lockTime, unlockTime, rLockTime, rUnlockTime} = response.data;
      responses.push(new Report(true, 'post ' + ind, startpost0.toFixed(3), performance.now().toFixed(3), item,
      backStartTime, backEndTime, lockTime, unlockTime, rLockTime, rUnlockTime));

      let startget0 = performance.now();
      API.get(
        `/api/items/` + response.data.item.id,
        { }
      ).then( (getresp) => {
        let {item, backStartTime, backEndTime, lockTime, unlockTime, rLockTime, rUnlockTime} = getresp.data;
        responses.push(new Report(true, 'get ' + ind, startget0.toFixed(3), performance.now().toFixed(3), item,
        backStartTime, backEndTime, lockTime, unlockTime, rLockTime, rUnlockTime));
        let startput0 = performance.now();
        API.put(
          `/api/items/` + response.data.item.id,
          {name: "phone test " + ind, count: 1}
        ).then((putresp) => {
          let {item, backStartTime, backEndTime, lockTime, unlockTime, rLockTime, rUnlockTime} = putresp.data;
          responses.push(new Report(true, 'put ' + ind, startput0.toFixed(3), performance.now().toFixed(3), item,
          backStartTime, backEndTime, lockTime, unlockTime, rLockTime, rUnlockTime));

          let startdelete0 = performance.now();
          API.delete(
            `/api/items/` + response.data.item.id,
            {}
          ).then((deleteresp) => {
            let {item, backStartTime, backEndTime, lockTime, unlockTime, rLockTime, rUnlockTime} = deleteresp.data;
            responses.push(new Report(true, 'delete ' + ind, startdelete0.toFixed(3), performance.now().toFixed(3), item,
            backStartTime, backEndTime, lockTime, unlockTime, rLockTime, rUnlockTime))
            setResults(responses);
          }).catch((err) => responses.push(new Report(false, 'ERROR: delete ' + ind, startdelete0, performance.now(), err)));
        }).catch((err) => responses.push(new Report(false, 'ERROR: put ' + ind, startput0, performance.now(), err)));
      }).catch((err) => responses.push(new Report(false, 'ERROR: get ' + ind, startget0, performance.now(), err)));
    }).catch((err) => responses.push(new Report(false, 'ERROR: post ' + ind, startpost0, performance.now(), err)));
  }

  async function promiseFlashBuy(id, reqind) {
    let startput0 = performance.now();
    await API.put(
      `/api/items/` + id,
      { }
    ).then( (response) => {
      let {msg, backStartTime, backEndTime, lockTime, unlockTime, rLockTime, rUnlockTime} = response.data;
      responses.push(
        new Report(true, 'put ' + id + ' no. ' + reqind, startput0.toFixed(3), performance.now().toFixed(3), msg,
        backStartTime, backEndTime, lockTime, unlockTime, rLockTime, rUnlockTime));
    }).catch((err) => responses.push(
      new Report(false, 'ERROR: put ' + id + ' no. ' + reqind, startput0.toFixed(3), performance.now().toFixed(3), err)));
  }

  return (
    <Container className="App">

      <Typography variant="h1" component="div" gutterBottom> 
        Test Client
      </Typography>

      <Stack direction="column" spacing={2} alignItems="flex-start"> 

        <LoadingButton 
          variant="outlined"
          onClick={() => send('reg')}
          endIcon={<SendIcon />}
          loading={loading}
          loadingPosition="end"
        >
          Regular Sale
        </LoadingButton>

        <LoadingButton 
          variant="outlined"
          onClick={() => send('fls')}
          endIcon={<SendIcon />}
          loading={loading}
          loadingPosition="end"
        >
          Flash Deal
        </LoadingButton>

        <Stack direction="row" spacing={2}> 

          <FormControlLabel control={<Switch
                checked={isSummaryMode}
                onChange={() => setIsSummaryMode(!isSummaryMode)}
                name="Switch Da Result"
                color="primary"
              />} label="Switch Result" />

          <Tooltip title="to handle uncertainty of React setState()">
            <Button onClick={handleClickRefresh}>Refresh Result</Button>
          </Tooltip>

        </Stack>

        <Typography component="p" paragraph>
            {results.length} Responses Received (using first {TOTAL_MINUTES * REQUEST_PER_SEC}). Last time {lastTime.toLocaleString()}
        </Typography>

        <div style={{width: "100%", whiteSpace: "pre-line"}}>{
          isSummaryMode?(<Typography component="p" paragraph> 
          {JSON.stringify(summary, null, "\t")}
        </Typography>)
          :(results.map((result, i) => (
            <Typography key={i} component="p" paragraph> 
              {JSON.stringify(result, null, "\t")}
            </Typography>
          )))
        }</div>

      </Stack>

    </Container>
  );
}


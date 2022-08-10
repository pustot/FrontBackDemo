import React, { useState, useEffect } from "react";
import "./styles.css";
import initSqlJs from "sql.js";
import ResultsTable from "./components/ResultsTable"
import {HashRouter as Router} from 'react-router-dom';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container'
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import SendIcon from '@mui/icons-material/Send';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';

import API from './utils/API'

const REG_READ_PER_REQ_W = 3;
const REG_WRITE_PER_REQ_W = 3;
const REG_READ_PER_REQ_R = 3;

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
  let responses = [];

  const [summary, setSummary] = useState(new Summary());
  const [results, setResults] = useState([]);
  const [isSummaryMode, setIsSummaryMode] = useState(true);
  // req senders use the same loading switch
  const [loading, setLoading] = React.useState(false);

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
      // setResults(responses);
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
      // setResults(responses);

      let startget0 = performance.now();
      API.get(
        `/api/items/` + response.data.item.id,
        { }
      ).then( (getresp) => {
        let {item, backStartTime, backEndTime, lockTime, unlockTime, rLockTime, rUnlockTime} = getresp.data;
        responses.push(new Report(true, 'get ' + ind, startget0.toFixed(3), performance.now().toFixed(3), item,
        backStartTime, backEndTime, lockTime, unlockTime, rLockTime, rUnlockTime));
        // setResults(responses);
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
    for (let r of responses) {
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
      responseTime / (responses.length - errorCount),
      responses.length / (responses[responses.length - 1].jsEndTime - responses[0].jsStartTime) * 1000,
      backTime / (responses.length - errorCount) / 1000000,
      lockTime / lockCnt / 1000000,
      unlockTime / lockCnt / 1000000,
      rLockTime / rLockCnt / 1000000,
      rUnlockTime / rLockCnt / 1000000,
      errorCount / responses.length,
      errorInterval / (errorCount - 1) / 1000
    ))
  }

  function sendRegularReq() {
    setLoading(true);
    // await new Promise(r => setTimeout(r, 2000));
    responses = [];

    var reqs = [];
    // W = 1/25
    // ReqW : ReqR = 1:23
    // ReqW = one every 24
    for (var i = 0; i < Math.floor(1500 / 3); i ++) {
      if (i % 24 != 0) {
        for (var j = 0; j < 3; j ++)
          reqs.push(promiseGetAll(3 * i + j));
      } else {
        reqs.push(promiseGetAll(3 * i + 0));
        reqs.push(promisePostGetPutDelete(3 * i + 1));
        reqs.push(promiseGetAll(3 * i + 2));
      }  
    }

    // reqs = [promiseGetAll(0), promisePostGetPutDelete(0)];
    
    Promise.all(reqs).then(() => {
      console.log('promise all done with len: ' + responses.length)
      setResults(responses);
      summaryCalculation(responses);
    });
    

    setLoading(false);
  }

  async function promiseFlashBuy(id, reqind) {
    // let startget0 = performance.now();
    // await API.get(
    //   `/api/items/` + id,
    //   { }
    // ).then( (response) => {
    //   responses.push(['get ' + id + ' no. ' + reqind, startget0.toFixed(3), performance.now().toFixed(3), response.data]);
    //   // setResults(responses);
    // }).catch((err) => responses.push(['ERROR: get ' + id + ' no. ' + reqind, startget0.toFixed(3), performance.now().toFixed(3), err]));

    let startput0 = performance.now();
    await API.put(
      `/api/items/` + id,
      { }
    ).then( (response) => {
      let {msg, backStartTime, backEndTime, lockTime, unlockTime, rLockTime, rUnlockTime} = response.data;
      responses.push(
        new Report(true, 'put ' + id + ' no. ' + reqind, startput0.toFixed(3), performance.now().toFixed(3), msg,
        backStartTime, backEndTime, lockTime, unlockTime, rLockTime, rUnlockTime));
      // setResults(responses);
    }).catch((err) => responses.push(
      new Report(false, 'ERROR: put ' + id + ' no. ' + reqind, startput0.toFixed(3), performance.now().toFixed(3), err)));
  }

  function sendFlashReq() {
    setLoading(true);

    var reqs = [];
    for (var i = 0; i < 1500; i ++) {
      reqs.push(promiseFlashBuy(i%5, i));
    }
    Promise.all(reqs).then(() => {
      console.log('promise all done with len: ' + responses.length)
      setResults(responses);
      summaryCalculation(responses);
    });

    setLoading(false);
  }

  const handleClickRefresh = () => {
    setResults(responses);
  }

  return (
    <Container className="App">

      <Typography variant="h1" component="div" gutterBottom> 
        Test Client
      </Typography>

      <Stack direction="column" spacing={2} alignItems="flex-start"> 

        <LoadingButton 
          variant="outlined"
          onClick={() => sendRegularReq()}
          endIcon={<SendIcon />}
          loading={loading}
          loadingPosition="end"
        >
          Regular Sale
        </LoadingButton>

        <LoadingButton 
          variant="outlined"
          onClick={() => sendFlashReq()}
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


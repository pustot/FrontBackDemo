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

export default function App() {
  let responses = [];

  const [results, setResults] = useState([]);
  const [isCardMode, setIsCardMode] = useState(true);
  // req senders use the same loading switch
  const [loading, setLoading] = React.useState(false);

  async function promiseGetAll(ind) {
    let startgetall0 = performance.now();
    await API.get(
      `/api/items`,
      { }
    ).then( (response) => {
      responses.push(['get all ' + ind, startgetall0.toFixed(3), performance.now().toFixed(3), response.data]);
      // setResults(responses);
    }).catch((err) => responses.push(['ERROR: get all ' + ind, startgetall0.toFixed(3), performance.now().toFixed(3), err]));
  }

  async function promisePostGetPutDelete(ind) {
    let startpost0 = performance.now();
    await API.post(
      `/api/items`,
      {name: "phone test " + ind, count: 2}
    ).then( (response) => {
      responses.push(['post ' + ind, startpost0.toFixed(3), performance.now().toFixed(3), response.data]);
      // setResults(responses);

      let startget0 = performance.now();
      API.get(
        `/api/items/` + response.data.id,
        { }
      ).then( (getresp) => {
        responses.push(['get ' + ind, startget0.toFixed(3), performance.now().toFixed(3), getresp.data]);
        // setResults(responses);
      }).catch((err) => responses.push(['ERROR: get ' + ind, startget0, performance.now(), err]));


      let startput0 = performance.now();
      API.put(
        `/api/items/` + response.data.id,
        {name: "phone test " + ind, count: 1}
      ).then((putresp) => {
        responses.push(['put ' + ind, startput0.toFixed(3), performance.now().toFixed(3), putresp.data]);

        let startdelete0 = performance.now();
        API.delete(
          `/api/items/` + response.data.id,
          {}
        ).then((deleteresp) => {
          responses.push(['delete ' + ind, startdelete0.toFixed(3), performance.now().toFixed(3), deleteresp.data])
          setResults(responses);
        }).catch((err) => responses.push(['ERROR: delete ' + ind, startdelete0, performance.now(), err]));
      }).catch((err) => responses.push(['ERROR: put ' + ind, startput0, performance.now(), err]));
    }).catch((err) => responses.push(['ERROR: post ' + ind, startpost0, performance.now(), err]));
  }

  function sendRegularReq() {
    setLoading(true);
    // await new Promise(r => setTimeout(r, 2000));
    responses = [];

    var reqs = [];
    // W = 1/25
    // ReqW : ReqR = 1:23
    // ReqW = one every 24
    for (var i = 0; i < 1000; i ++) {
      if (i % 24 != 0) {
        for (var j = 0; j < 3; j ++)
          reqs.push(promiseGetAll(3 * i + j));
      } else {
        reqs.push(promiseGetAll(3 * i + 0));
        reqs.push(promisePostGetPutDelete(3 * i + 1));
        reqs.push(promiseGetAll(3 * i + 2));
      }  
    }
    
    Promise.all(reqs).then(() => {
      console.log('promise all done with len: ' + responses.length)
      setResults(responses);
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
      responses.push(['put ' + id + ' no. ' + reqind, startput0.toFixed(3), performance.now().toFixed(3), response.data]);
      // setResults(responses);
    }).catch((err) => responses.push(['ERROR: put ' + id + ' no. ' + reqind, startput0.toFixed(3), performance.now().toFixed(3), err]));
  }

  function sendFlashReq() {
    setLoading(true);

    var reqs = [];
    for (var i = 0; i < 10000; i ++) {
      reqs.push(promiseFlashBuy(i%5, i));
    }
    Promise.all(reqs).then(() => {
      console.log('promise all done with len: ' + responses.length)
      setResults(responses);
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
                checked={isCardMode}
                onChange={() => setIsCardMode(!isCardMode)}
                name="Switch Da Result"
                color="primary"
              />} label="Switch Result" />

          <Tooltip title="to handle uncertainty of React setState()">
            <Button onClick={handleClickRefresh}>Refresh Result</Button>
          </Tooltip>

        </Stack>

        <div style={{width: "100%"}}>{
          results.map((result, i) => (
            <Typography key={i} component="p" paragraph> 
              {JSON.stringify(result)}
            </Typography>
          ))
        }</div>

      </Stack>

    </Container>
  );
}


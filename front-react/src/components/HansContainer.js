import React from 'react'
import Grid from '@mui/material/Grid';
import HanCard from './HanCard'
import "../styles.css";

// let res = [
//     {
//         'id': '2665',
//         'mc': 'hello from React',
//     },
//     {
//         'id': '4F6F',
//         'mc': 'jang,ziang',
//     },
//     {
//         'id': '5134',
//         'mc': 'njang',
//     }
// ];

const HansContainer = ({ data }) => {
    return (
        <div>
        <Grid container className="hans-container" spacing={1} 
                direction="row" justifyContent="flex-start" 
                alignItems="stretch">
            {data.map(
                (row, i) =>
                <Grid key={i} item xs={12} sm={4}>
                    <HanCard key={i} rowdata={[row['id'], row['mc']]}/>
                </Grid>
            )}
        </Grid>
        </div>
    );
}

export default HansContainer;
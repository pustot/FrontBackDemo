import Typography from '@mui/material/Typography';

const ResultsArea = ({ data }) => {
    console.log('gut' + data);
    return (
        <Typography variant="body1" gutterBottom> 
            {JSON.stringify(data)} 
        </Typography>
    );
}

export default ResultsArea;
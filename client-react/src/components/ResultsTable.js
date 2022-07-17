import "../styles.css";

/**
 * Renders a single value of the array returned by db.exec(...) as a table
 * @param {import("sql.js").QueryExecResult} props
 */
const ResultsTable = ({ columns, values }) => {
    return (
        <table class="results-table">
          <thead>
            <tr>
                <td key={-1}>Han</td>
                {columns.map((columnName, i) => (
                  <td key={i}>{columnName}</td>
                ))}
            </tr>
          </thead>
    
          <tbody>
            {
              // values is an array of arrays representing the results of the query
              values.map((row, i) => (
                <tr key={i}>
                    <td key={-1}>{String.fromCodePoint(Number('0x' + row[0]))}</td>
                  {row.map((value, i) => (
                    <td key={i}>{value}</td>
                  ))}
                </tr>
              ))
            }
          </tbody>
        </table>
      );
};

export default ResultsTable;
import React from 'react';
import { FaCheck } from 'react-icons/fa';
import { Checkbox } from 'pretty-checkbox-react';

const CinemaData = ({ cinemaData, onVote, disabled, percentage, showResults }) => {
  const showtimesAvailable = Array.isArray(cinemaData.showtimes);

  return (
    <div>
      <div style={styles.divider} />

      <div style={styles.container}>
        {!showResults && (
          <div style={styles.vote}>
              <Checkbox
                onChange={onVote}
                disabled={disabled}
                shape="round" 
                color="info"
                variant="fill"
                animation="jelly"
              />
              
          </div>
        )}
        <div style={styles.dataContainer}>
          <h2 style={styles.heading}>
              {cinemaData.name}
          </h2>

          <div style={styles.container}>
          {showtimesAvailable ? (
            <ul style={styles.list}>
              {cinemaData.showtimes.map((time, index) => (
                <li key={index} style={styles.listItem}>
                  {time}
                </li>
              ))}
            </ul>
          )
          : (
            <p style={styles.noShowtimes}>No showtimes available</p>
          )}
            <div style={styles.results}>
              {showResults && (
                <div style={styles.percentage}>
                  <p style={{ textAlign: "right", margin: 0 }}>
                    {percentage !== null && !isNaN(percentage) && percentage !== undefined
                      ? `${percentage}%`
                      : '0%'}
                  </p>
                </div>
              )}
            </div>
          </div>
          <p style={styles.paragraph}>
            <a href={cinemaData.url} style={styles.link}>
              Comprar ingresso
            </a>          
            <br/>
            <strong style={styles.strong}>Preço da meia:</strong> R$ {cinemaData.price}

          </p>
        </div>
      </div>

    </div>

  );
};

const styles = {
  checkbox: {
  },
  dataContainer: {
    maxWidth: '95vw',
  },
  divider: {
    height: '1px',
    width: '85vw',
    backgroundColor: '#60677165',
    margin: '0.4rem 0', 
    borderRadius: '0.2rem',
    marginBottom: '0.9rem',
    marginTop: '0.9rem',

  },
  vote: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  list:{
    marginBottom:0,
    marginTop: '1rem',
  },
  heading: {
    margin: 0,
  },
  paragraph: {
    marginBottom: '0.525rem',
    marginTop: '0rem'
  },
  results: {
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'center',
    marginLeft: '8.5rem',
  },
  container: {
    display: 'flex',
    flexDirection: 'row',
  },
  label: {
    marginTop: '0.625rem',
    display: 'flex',
    alignItems: 'center',
  },
  link: {
    color: '#58a6ff',
    cursor: 'pointer',
  }, 
  percentage: {
    color: '#28a745',
    fontWeight: 'bold',
    marginLeft: '0.625rem',
    fontSize: '1.875rem',
    width: '6.6rem',
  },
  votedText: {
    color: '#58a6ff',
    fontStyle: 'italic',
  },
};

export default CinemaData;

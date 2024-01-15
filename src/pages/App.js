import React, { useEffect, useState } from 'react';
import CinemaData from '../components/CinemaData';
import { initializeApp } from "firebase/app";
import {
  getFirestore, 
  collection,
  getDocs,
  doc,
  setDoc,
  getDoc,
} from 'firebase/firestore';
import {
  getAuth,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
} from 'firebase/auth';
import { app } from '../index.js';
import { HashLoader } from 'react-spinners';

const MovieSchedule = () => {
  const [votedCinemas, setVotedCinemas] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [localVotes, setLocalVotes] = useState({});
  const [cinemas, setCinemas] = useState([]);
  const [user, setUser] = useState(null);
  const [existingVoteData, setExistingVoteData] = useState(null);
  const [hasBeenVoted, setHasBeenVoted] = useState(false);
  const [loading, setLoading] = useState(false);


  const convertToExistingVoteData = (cinemaData) => {
    let wholeData = {};
    cinemaData.forEach(element => {

      let key = element.id;
      let obj = {
        localVotes: 0,
        serverVotes: element.votes,
        totalVotes: element.votes,
        whoVoted: element.whoVoted
      };
      wholeData[key] = obj;
    });
    return(wholeData);
  }
  const fetchUser = async () => {
    const user = getAuth().currentUser;
    return user;
  };

  const fetchData = async () => {
    try {
      const db = getFirestore(app);
      const cinemasCollection = collection(db, 'cinemaVotes');
      const cinemasData = await getDocs(cinemasCollection);

      const cinemasArray = cinemasData.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setCinemas(cinemasArray);

      if (existingVoteData == null) {
        const user = await fetchUser();

        let voted = false; 

        const userVotePromises = cinemasArray.map((cinema) => {
          console.log(user)
          if (cinema.whoVoted.includes(user?.uid)) {
            console.log("teet")
            voted = true;
          }
        });

        await Promise.all(userVotePromises);

        setHasBeenVoted(voted);

        if (voted) {
          setExistingVoteData(convertToExistingVoteData(cinemasArray));

          console.log(user)

          setShowResults(true);
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {


    const unsubscribe = onAuthStateChanged(getAuth(), (authUser) => {
      if (authUser) {
        setUser(authUser);
      } else {
        setUser(null);
      }
    });

    fetchData();

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    console.log(existingVoteData);
  }, [existingVoteData]);

  const fetchExistingVote = async (cinemaId) => {
    try {
      const db = getFirestore(app);
      const cinemaVotesCollection = collection(db, 'cinemaVotes');
      const voteDoc = doc(cinemaVotesCollection, cinemaId);
      const existingVoteData = await getDoc(voteDoc);
      return existingVoteData.data();
    } catch (error) {
      console.error('Error fetching existing vote:', error);
    }
  };

  const handleVote = async (cinemaId) => {
    if (!votedCinemas[cinemaId]) {
      setVotedCinemas((prevVotes) => ({ ...prevVotes, [cinemaId]: true }));
    } else {
      setVotedCinemas((prevVotes) => {
        const updatedVotes = { ...prevVotes };
        delete updatedVotes[cinemaId];
        return updatedVotes;
      });
    }
  };

  const handleShowResults = async () => {

    try {
      const db = getFirestore();
      const cinemaVotesCollection = collection(db, 'cinemaVotes');

      const serverDataPromises = cinemas.map(async (cinema) => {
        const voteDoc = doc(cinemaVotesCollection, cinema.id);
        const serverData = await getDoc(voteDoc);
        return { id: cinema.id, serverData: serverData.data() || {} };
      });

      const serverDataResults = await Promise.all(serverDataPromises);

      const mergedVotes = {};

      serverDataResults.forEach(({ id, serverData }) => {
        const localVoteCount = localVotes[id] || 0;
        const serverVoteCount = serverData.votes || 0;

        mergedVotes[id] = {
          localVotes: localVoteCount,
          serverVotes: serverVoteCount,
          totalVotes: serverVoteCount,
          whoVoted: serverData.whoVoted || [],
        };
      });

      setExistingVoteData(mergedVotes);
    } catch (error) {
      console.error('Error fetching and merging vote data:', error);
    }
    setShowResults(true);
  };

  const signIn = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(getAuth(), provider);
      await fetchData();
    } catch (error) {
      console.error('Error signing in:', error);
    }
    setLoading(false);
  };

  const signOutUser = async () => {
    try {
      await signOut(getAuth());
      await getAuth().currentUser.clearCache();
      setUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };
  const sendVotesToServer = async () => {

    const db = getFirestore();
    const cinemaVotesCollection = collection(db, 'cinemaVotes');

    for (const cinemaId in votedCinemas) {
      setLoading(true);

      try {
        const voteDoc = doc(cinemaVotesCollection, cinemaId);

        const existingVoteData = await fetchExistingVote(cinemaId);

        if (existingVoteData) {
         
          const currentVotes = existingVoteData?.votes || 0;
          const whoVotedArray = existingVoteData?.whoVoted || [];

          await setDoc(voteDoc, {
            votes: currentVotes + 1,
            whoVoted: [...whoVotedArray, user.uid], 
          }, { merge: true });

          setLocalVotes((prevLocalVotes) => ({
            ...prevLocalVotes,
            [cinemaId]: (prevLocalVotes[cinemaId] || 0) + 1,
          }));

          const updatedVoteData = await fetchExistingVote(cinemaId);
          setExistingVoteData(updatedVoteData);
        }
      } catch (error) {
        console.error('Error updating vote:', error);
      }
      handleShowResults();
      setLoading(false);

    }  };
  
  return (
    <div style={styles.pageContainer}>
      <div style={styles.containerHorizontal}>
        <h1 style={styles.heading}>Horários e preços de Meninas Malvadas nos Cinemas de São Paulo</h1>

        {user && (
          <button style={styles.signOutButton} onClick={signOutUser}>
            Sign Out
          </button>
        )}
      </div>
      {
        !loading ? (
          <>
            {user ? (
            
            <>
              {cinemas.sort((a, b) => a.price - b.price ).map((cinema, index) => (
                <CinemaData
                  key={index}
                  cinemaData={cinema}
                  onVote={() => handleVote(cinema.id)}
                  disabled={!user}
                  percentage={
                    showResults && existingVoteData[cinema.id]
                      ? (
                          (existingVoteData[cinema.id].totalVotes /
                            Object.values(existingVoteData).reduce((a, b) => a + b.totalVotes, 0)) *
                          100
                        ).toFixed(2)
                      : undefined
                  }
                  showResults={showResults}
                />
              ))}
              {!showResults ? (
                <button
                  style={{
                    ...styles.voteButton,
                    backgroundColor: !Object.keys(votedCinemas).length ? 'gray' : styles.voteButton.backgroundColor
                  }}
                  onClick={sendVotesToServer}
                  disabled={!Object.keys(votedCinemas).length}
                >
                  Votar
                </button>
              ):(              
                <div style={styles.divider} />
              )}

              {showResults && (
                <div style={styles.resultsContainer}>
                  <h2 style={styles.resultsHeading}>Resultado da Votação</h2>
                  {cinemas.sort((a, b) => b.votes - a.votes).map((cinema, index) => (
                    <div key={index} style={styles.resultItem}>
                      {cinema.name.split('—')[1].trim()}: <strong>{existingVoteData[cinema.id]?.totalVotes || 0} votos (
                      {(
                        ((existingVoteData[cinema.id]?.totalVotes /
                          Object.values(existingVoteData).reduce((a, b) => a + b.totalVotes, 0)) *
                          100) ||
                        0
                      ).toFixed(2)}
                      %)</strong>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <button style={styles.signInButton} onClick={signIn}>
              Sign In with Google
            </button>
          )}
          </>
        ) : (
          <div style={{display: "flex", flex: 1, flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <p>Loading...</p>
            <HashLoader
              color={"#ffffff"}
              loading={loading}
              size={200}
            />
          </div>
        )
      }
    </div>
  );
};

const styles = {
  pageContainer: {
    width: '100%',
    padding: '1.25rem',
    boxSizing: 'border-box',
    fontFamily: 'Arial, sans-serif',
    backgroundColor: '#0d1117',
    color: '#c9d1d9',
  },
  containerHorizontal:{
    display: 'flex',
    justifyContent: 'space-between',
    flexDirection: 'row',
    alignItems: 'center',
  },
  heading: {
    color: '#58a6ff',
    marginBottom: '1.25rem',
    fontSize: "1.75rem"
  },
  voteButton: {
    backgroundColor: '#28a745',
    color: '#fff',
    padding: '0.625rem',
    border: 'none',
    borderRadius: '0.25rem',
    cursor: 'pointer',
    marginTop: '1.25rem',
    fontSize: '1rem',
  },
  signInButton: {
    backgroundColor: '#4285f4',
    color: '#fff',
    padding: '0.625rem',
    border: 'none',
    borderRadius: '0.25rem',
    cursor: 'pointer',
    marginTop: '1.25rem',
    fontSize: '1rem',
  },
  signOutButton: {
    backgroundColor: '#dc3545',
    color: '#fff',
    padding: '0.625rem',
    border: 'none',
    borderRadius: '0.25rem',
    cursor: 'pointer',
    marginTop: '1.25rem',
    minWidth: '4.25rem',
    maxHeight: '3.25rem',
  },
  resultsContainer: {
    marginTop: '1.25rem',
  },
  resultsHeading: {
    color: '#58a6ff',
    marginBottom: '0.625rem',
  },
  resultItem: {
    marginBottom: '0.55rem',
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
};

export default MovieSchedule;

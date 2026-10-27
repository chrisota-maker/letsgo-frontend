import { useEffect, useState } from "react";
import { apiFetch } from "../api/client";
import { useAuth } from "../auth/AuthContext";
import PeepsTabs from "../components/PeepsTabs";
import ConfirmDialog from "../components/ConfirmDialog";

// One row in a list: avatar, name, @username, then whatever buttons are passed in.
function PersonRow({ displayName, username, children }) {
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <li className="person">
      <div className="avatar" aria-hidden="true">{initial}</div>
      <div className="person-info">
        <p className="person-name">{displayName}</p>
        <p className="person-handle">@{username}</p>
      </div>
      {children}
    </li>
  );
}

export default function FindFriend() {
  const { token, logout } = useAuth();

  const [friendships, setFriendships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);                 // problems loading the lists
  const [actionError, setActionError] = useState(null);     // problems with add, accept, decline, cancel, remove
  const [actionSuccess, setActionSuccess] = useState(null); // "Request sent to ..."
  const [removingFriend, setRemovingFriend] = useState(null); // friend waiting for remove confirmation, or null
  const [refreshCount, setRefreshCount] = useState(0);      // bump this to reload the lists

  const [searchText, setSearchText] = useState("");
  const [results, setResults] = useState([]);
  const [searchError, setSearchError] = useState(null);

  // ---------- Load my friendships ----------
  useEffect(() => {
    async function loadFriendships() {
      setLoading(true);
      setError(null);

      try {
        const data = await apiFetch("/friendships", { token: token });
        setFriendships(data.friends);
      } catch (err) {
        if (err.status === 401) {
          logout();
          return;
        }
        setError(err.message);
      }

      setLoading(false);
    }

    loadFriendships();
  }, [token, logout, refreshCount]);

  // ---------- Search as you type ----------
  const trimmedSearch = searchText.trim();
  const showResults = trimmedSearch.length >= 2;

  useEffect(() => {
    if (trimmedSearch.length < 2) {
      return; // too short: don't search
    }

    let cancelled = false; // set to true if the user keeps typing before this finishes

    // Wait 300ms after the last keystroke, so we don't send a request for every letter.
    const timer = setTimeout(async () => {
      try {
        const data = await apiFetch(`/users/search?q=${encodeURIComponent(trimmedSearch)}`, {
          token: token,
        });
        if (!cancelled) {
          setSearchError(null);
          setResults(data.users);
        }
      } catch (err) {
        if (!cancelled) {
          setSearchError(err.message);
        }
      }
    }, 300);

    // Runs before the next search starts (or when leaving the page).
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [trimmedSearch, token]);

  function reloadLists() {
    setRefreshCount(refreshCount + 1);
  }

  // ---------- Split into the three groups ----------
  const friends = [];   // accepted, either direction
  const incoming = [];  // pending, and the friend is the one who sent it
  const sent = [];      // pending, and I'm the one who sent it

  for (const friendship of friendships) {
    if (friendship.status === "accepted") {
      friends.push(friendship);
    } else if (friendship.sender_id === friendship.friend_id) {
      incoming.push(friendship);
    } else {
      sent.push(friendship);
    }
  }

  // For a search result, what's my connection to this person?
  function getConnection(userId) {
    for (const friendship of friendships) {
      if (friendship.friend_id === userId) {
        if (friendship.status === "accepted") {
          return "friends";
        } else if (friendship.sender_id === friendship.friend_id) {
          return "incoming";
        } else {
          return "sent";
        }
      }
    }
    return "none";
  }

  // ---------- Add (send a request) ----------
  async function handleAdd(user) {
    setActionError(null);
    setActionSuccess(null);
    try {
      await apiFetch("/friendships", {
        method: "POST",
        token: token,
        body: { username: user.username },
      });
      setActionSuccess(`Request sent to ${user.display_name}`);
      reloadLists();
    } catch (err) {
      setActionError(err.message);
    }
  }

  // ---------- Accept, decline, cancel ----------
  async function handleAccept(friendship) {
    setActionError(null);
    setActionSuccess(null);
    try {
      await apiFetch(`/friendships/${friendship.friend_id}/accept`, {
        method: "PUT",
        token: token,
      });
      reloadLists();
    } catch (err) {
      setActionError(err.message);
    }
  }

  // Decline (a request to me), cancel (a request I sent), and remove are the same delete.
  async function handleDeleteFriendship(friendship) {
    setActionError(null);
    setActionSuccess(null);
    try {
      await apiFetch(`/friendships/${friendship.friend_id}`, {
        method: "DELETE",
        token: token,
      });
      reloadLists();
    } catch (err) {
      setActionError(err.message);
    }
  }

  // ---------- Remove a friend (with confirmation) ----------
  function handleAskRemove(friendship) {
    setRemovingFriend(friendship);
  }

  function handleCancelRemove() {
    setRemovingFriend(null);
  }

  async function handleConfirmRemove() {
    await handleDeleteFriendship(removingFriend);
    setRemovingFriend(null);
  }

  function handleSearchChange(e) {
    setSearchText(e.target.value);
  }

  return (
    <>
      <PeepsTabs />

      <h1 className="page-heading">Add a friend</h1>

      <label htmlFor="friend-search" className="sr-only">Search by username</label>
      <input
        id="friend-search"
        className="field search-field"
        type="search"
        placeholder="Search by username"
        autoComplete="off"
        autoCapitalize="none"
        value={searchText}
        onChange={handleSearchChange}
      />

      {actionSuccess && <p role="status" className="notice">{actionSuccess}</p>}
      {actionError && <p role="alert" className="alert notice-spacing">{actionError}</p>}

      {/* ---------- Search results ---------- */}
      {showResults && (
        <section className="section">
          <h2 className="section-title">Results</h2>

          {searchError && <p role="alert" className="alert notice-spacing">{searchError}</p>}

          {!searchError && results.length === 0 && (
            <p className="empty-note muted">No one found with that username.</p>
          )}

          {!searchError && results.length > 0 && (
            <ul className="person-list">
              {results.map((user) => {
                const connection = getConnection(user.id);

                return (
                  <PersonRow key={user.id} displayName={user.display_name} username={user.username}>
                    {connection === "none" && (
                      <button
                        type="button"
                        className="small-button primary"
                        onClick={() => handleAdd(user)}
                      >
                        Add
                      </button>
                    )}
                    {connection === "friends" && <span className="tag">Peeps</span>}
                    {connection === "sent" && <span className="tag">Requested</span>}
                    {connection === "incoming" && <span className="tag">Wants to add you</span>}
                  </PersonRow>
                );
              })}
            </ul>
          )}
        </section>
      )}

      {loading && <p className="status muted">Loading...</p>}
      {error && <p role="alert" className="alert status">{error}</p>}

      {!loading && !error && (
        <>
          {/* ---------- Requests for you ---------- */}
          {incoming.length > 0 && (
            <section className="section">
              <h2 className="section-title">
                Requests for you <span className="count">{incoming.length}</span>
              </h2>
              <ul className="person-list">
                {incoming.map((friendship) => (
                  <PersonRow
                    key={friendship.friend_id}
                    displayName={friendship.friend_display_name}
                    username={friendship.friend_username}
                  >
                    <button
                      type="button"
                      className="small-button"
                      onClick={() => handleDeleteFriendship(friendship)}
                    >
                      Decline
                    </button>
                    <button
                      type="button"
                      className="small-button primary"
                      onClick={() => handleAccept(friendship)}
                    >
                      Accept
                    </button>
                  </PersonRow>
                ))}
              </ul>
            </section>
          )}

          {/* ---------- Sent ---------- */}
          {sent.length > 0 && (
            <section className="section">
              <h2 className="section-title">Sent</h2>
              <ul className="person-list">
                {sent.map((friendship) => (
                  <PersonRow
                    key={friendship.friend_id}
                    displayName={friendship.friend_display_name}
                    username={friendship.friend_username}
                  >
                    <span className="waiting">Waiting</span>
                    <button
                      type="button"
                      className="small-button"
                      onClick={() => handleDeleteFriendship(friendship)}
                    >
                      Cancel
                    </button>
                  </PersonRow>
                ))}
              </ul>
            </section>
          )}

          {/* ---------- Your peeps ---------- */}
          <section className="section">
            <h2 className="section-title">Your peeps</h2>
            {friends.length === 0 && (
              <p className="empty-note muted">No peeps yet. Search for someone to get started.</p>
            )}
            {friends.length > 0 && (
              <ul className="person-list">
                {friends.map((friendship) => (
                  <PersonRow
                    key={friendship.friend_id}
                    displayName={friendship.friend_display_name}
                    username={friendship.friend_username}
                  >
                    <button
                      type="button"
                      className="small-button"
                      onClick={() => handleAskRemove(friendship)}
                    >
                      Remove
                    </button>
                  </PersonRow>
                ))}
              </ul>
            )}
          </section>
        </>
      )}

      {removingFriend && (
        <ConfirmDialog
          heading="Remove this peep?"
          message={`You and ${removingFriend.friend_display_name} will no longer see each other's shared days.`}
          confirmLabel="Remove"
          onConfirm={handleConfirmRemove}
          onCancel={handleCancelRemove}
        />
      )}
    </>
  );
}
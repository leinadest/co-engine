'use client';

export default function Error({ error }: { error: any }) {
  return (
    <>
      <h5>Add Friends</h5>
      <p>Search by username and discriminator to find users to befriend.</p>
      <form>
        <input
          type="text"
          name="search"
          placeholder="Enter username#discriminator"
        />
        <button>Send Friend Request</button>
      </form>
      <p className="error">{error.message}</p>
    </>
  );
}

{success && success.length ? (
    <div className="alert alert-success alert-dismissible fade show col-6 offset-3" role="alert">
        {success}
        <button type="button" className="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    </div>
) : null}

{error && error.length ? (
    <div className="alert alert-danger alert-dismissible fade show col-6 offset-3" role="alert">
        {error}
        <button type="button" className="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    </div>
) : null}

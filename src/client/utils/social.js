const fromSocial = {
  google: (info) => {
    const {
        idpId,
        id_token,
        access_token,
        expires_at,
        expires_in,
      } = info.getAuthResponse(),
      { email, googleId, imageUrl, name } = info.profileObj;
    return {
      social: {
        provider: idpId,
        id: googleId,
        name,
        email,
        imageUrl,
      },
      auth: {
        id_token,
        access_token,
        expires_at,
        expires_in,
      },
    };
  },
  facebook: (info) => {
    const {
        graphDomain: provider,
        name,
        email,
        picture,
        userID: id,
        signedRequest: id_token,
        data_access_expiration_time: expires_at,
        expiresIn: expires_in,
        accessToken: access_token,
      } = info,
      social = {
        provider,
        id,
        name,
        email,
        imageUrl: picture.data.url,
        auth: {
          id_token,
          expires_at,
          expires_in,
          access_token,
        },
      };
    return { social, id_token };
  },
};

export { fromSocial };

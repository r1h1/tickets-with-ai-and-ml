CREATE PROCEDURE sp_authInsert
    @UserId INT,
    @PasswordHash NVARCHAR(255),
    @Salt NVARCHAR(100),
    @NewAuthId INT OUTPUT,
    @Success BIT OUTPUT
    AS
BEGIN
    SET NOCOUNT ON;

BEGIN TRY
INSERT INTO Auth (UserId, PasswordHash, Salt)
        VALUES (@UserId, @PasswordHash, @Salt);

        SET @NewAuthId = SCOPE_IDENTITY();
        SET @Success = 1;
END TRY
BEGIN CATCH
SET @NewAuthId = NULL;
        SET @Success = 0;
        THROW;
END CATCH
END;
GO

CREATE PROCEDURE sp_authUpdatePassword
    @UserId INT,
    @PasswordHash NVARCHAR(255),
    @Salt NVARCHAR(100),
    @Success BIT OUTPUT
    AS
BEGIN
    SET NOCOUNT ON;

BEGIN TRY
UPDATE Auth
SET PasswordHash = @PasswordHash,
    Salt = @Salt
WHERE UserId = @UserId AND State = 1;

SET @Success = IIF(@@ROWCOUNT > 0, 1, 0);
END TRY
BEGIN CATCH
SET @Success = 0;
        THROW;
END CATCH
END;
GO

CREATE PROCEDURE sp_authSelectByUserId
    @UserId INT,
    @Email NVARCHAR(100)
    AS
BEGIN
    SET NOCOUNT ON;

SELECT
    a.AuthId,
    a.UserId,
    a.PasswordHash,
    a.Salt,
    a.LastLogin,
    a.State,
    u.RoleId,
    u.Email
FROM Auth a
         INNER JOIN Users u ON a.UserId = u.UserId
WHERE u.UserId = @UserId
  AND u.Email = @Email
  AND a.State = 1
  AND u.State = 1;
END;
GO


CREATE PROCEDURE sp_authSelectByUserIdOnly
    @UserId INT
AS
BEGIN
    SET NOCOUNT ON;

SELECT
    a.AuthId,
    a.UserId,
    a.PasswordHash,
    a.Salt,
    a.LastLogin,
    a.State,
    u.RoleId,
    u.Email
FROM Auth a
         INNER JOIN Users u ON a.UserId = u.UserId
WHERE u.UserId = @UserId
  AND a.State = 1;
END;
GO



CREATE PROCEDURE sp_authUpdateLastLogin
    @UserId INT,
    @Success BIT OUTPUT
    AS
BEGIN
    SET NOCOUNT ON;

BEGIN TRY
UPDATE Auth
SET LastLogin = GETDATE()
WHERE UserId = @UserId AND State = 1;

SET @Success = IIF(@@ROWCOUNT > 0, 1, 0);
END TRY
BEGIN CATCH
SET @Success = 0;
        THROW;
END CATCH
END;
GO

CREATE PROCEDURE sp_authLogicDelete
    @UserId INT,
    @Success BIT OUTPUT
    AS
BEGIN
    SET NOCOUNT ON;

BEGIN TRY
UPDATE Auth
SET State = 0
WHERE UserId = @UserId AND State = 1;

SET @Success = IIF(@@ROWCOUNT > 0, 1, 0);
END TRY
BEGIN CATCH
SET @Success = 0;
        THROW;
END CATCH
END;
GO
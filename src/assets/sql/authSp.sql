-- INSERT
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

-- UPDATE PASSWORD
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

-- SELECT TO LOGIN
CREATE PROCEDURE sp_authSelectByUserId
    @UserId INT
AS
BEGIN
    SET NOCOUNT ON;

SELECT AuthId, UserId, PasswordHash, Salt, LastLogin, State
FROM Auth
WHERE UserId = @UserId AND State = 1;
END;
GO

-- UPDATE LAST LOGIN DATE
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

-- LOGICAL DELETE
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
-- INSERT
CREATE PROCEDURE sp_userInsert
    @Name NVARCHAR(100),
    @Email NVARCHAR(150),
    @RoleId INT,
    @SeniorityLevel NVARCHAR(150),
    @NewUserId INT OUTPUT,
    @Success BIT OUTPUT
AS
BEGIN
    SET NOCOUNT ON;

BEGIN TRY
INSERT INTO Users (Name, Email, RoleId, SeniorityLevel)
        VALUES (@Name, @Email, @RoleId, @SeniorityLevel);

        SET @NewUserId = SCOPE_IDENTITY();
        SET @Success = 1;
END TRY
BEGIN CATCH
SET @NewUserId = NULL;
        SET @Success = 0;
END CATCH
END;
GO

-- UPDATE
CREATE PROCEDURE sp_userUpdate
    @UserId INT,
    @Name NVARCHAR(100),
    @Email NVARCHAR(150),
    @RoleId INT,
    @SeniorityLevel NVARCHAR(150),
    @Success BIT OUTPUT
AS
BEGIN
    SET NOCOUNT ON;

BEGIN TRY
UPDATE Users
SET Name = @Name,
    Email = @Email,
    RoleId = @RoleId,
    SeniorityLevel = @SeniorityLevel
WHERE UserId = @UserId AND State = 1;

SET @Success = IIF(@@ROWCOUNT > 0, 1, 0);
END TRY
BEGIN CATCH
SET @Success = 0;
END CATCH
END;
GO

-- SELECT ALL
CREATE PROCEDURE sp_userSelectAll
    AS
BEGIN
    SET NOCOUNT ON;

SELECT
    U.UserId,
    U.Name,
    U.Email,
    U.RoleId,
    R.RoleName,
    U.SeniorityLevel,
    U.IsActive,
    U.CreatedAt,
    U.State
FROM Users U
         INNER JOIN Roles R ON U.RoleId = R.RoleId
WHERE U.State = 1;
END;
GO

-- SELECT BY ID
CREATE PROCEDURE sp_userSelectById
    @UserId INT
AS
BEGIN
    SET NOCOUNT ON;

SELECT
    U.UserId,
    U.Name,
    U.Email,
    U.RoleId,
    R.RoleName,
    U.SeniorityLevel,
    U.IsActive,
    U.CreatedAt,
    U.State
FROM Users U
         INNER JOIN Roles R ON U.RoleId = R.RoleId
WHERE U.UserId = @UserId AND U.State = 1;
END;
GO

-- LOGICAL DELETE
CREATE PROCEDURE sp_userLogicDelete
    @UserId INT,
    @Success BIT OUTPUT
AS
BEGIN
    SET NOCOUNT ON;

BEGIN TRY
UPDATE Users
SET State = 0
WHERE UserId = @UserId AND State = 1;

SET @Success = IIF(@@ROWCOUNT > 0, 1, 0);
END TRY
BEGIN CATCH
SET @Success = 0;
END CATCH
END;
GO

-- INSERT
CREATE PROCEDURE sp_rolInsert
    @RoleName NVARCHAR(50),
    @AssignedMenus NVARCHAR(MAX),
    @NewRoleId INT OUTPUT,
    @Success BIT OUTPUT
AS
BEGIN
    SET NOCOUNT ON;

BEGIN TRY
INSERT INTO Roles (RoleName, AssignedMenus)
        VALUES (@RoleName, @AssignedMenus);

        SET @NewRoleId = SCOPE_IDENTITY();
        SET @Success = 1;
END TRY
BEGIN CATCH
SET @NewRoleId = NULL;
        SET @Success = 0;
        THROW;
END CATCH
END;
GO

-- UPDATE
CREATE PROCEDURE sp_rolUpdate
    @RoleId INT,
    @RoleName NVARCHAR(50),
    @AssignedMenus NVARCHAR(MAX),
    @Success BIT OUTPUT
AS
BEGIN
    SET NOCOUNT ON;

BEGIN TRY
UPDATE Roles
SET RoleName = @RoleName,
    AssignedMenus = @AssignedMenus
WHERE RoleId = @RoleId AND State = 1;

SET @Success = IIF(@@ROWCOUNT > 0, 1, 0);
END TRY
BEGIN CATCH
SET @Success = 0;
        THROW;
END CATCH
END;
GO

-- SELECT ALL
CREATE PROCEDURE sp_rolSelectAll
    AS
BEGIN
    SET NOCOUNT ON;

SELECT RoleId, RoleName, AssignedMenus, State
FROM Roles
WHERE State = 1;
END;
GO

-- SELECT SPECIFIC ID
CREATE PROCEDURE sp_rolSelectById
    @RoleId INT
AS
BEGIN
    SET NOCOUNT ON;

SELECT RoleId, RoleName, AssignedMenus, State
FROM Roles
WHERE RoleId = @RoleId AND State = 1;
END;
GO

-- LOGICAL DELETE
CREATE PROCEDURE sp_rolLogicDelete
    @RoleId INT,
    @Success BIT OUTPUT
AS
BEGIN
    SET NOCOUNT ON;

BEGIN TRY
UPDATE Roles
SET State = 0
WHERE RoleId = @RoleId AND State = 1;

SET @Success = IIF(@@ROWCOUNT > 0, 1, 0);
END TRY
BEGIN CATCH
SET @Success = 0;
        THROW;
END CATCH
END;
GO